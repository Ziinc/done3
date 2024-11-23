// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { auth, GoogleAuth } from "npm:google-auth-library";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import express from "npm:express@4.18.2";
import cors from "npm:cors";
const app = express();
app.use(
  cors({
    origin: true,
    allowedHeaders: [
      "authorization",
      "x-client-info",
      "apikey",
      "content-type",
    ],
    methods: ["GET", "PUT", "PATCH", "DELETE", "POST"],
  })
);
app.use(express.json());

app.get("/notes", async (req, res) => {
  // return all notes

  const sbClient = makeSbClient(req);
  const authHeader = req.header("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data } = await sbClient.auth.getUser(token);
  const user = data.user;
  if (!user) {
    return res.status(400).json({ error: "Must be authenticated" });
  }
  const client = makeGoogleClient(user.email);

  let rawNotes = [];
  let emptyPageReceived = false;
  let nextPageToken = undefined;
  let attempts = 0;
  while (
    (attempts == 0 && !nextPageToken && !emptyPageReceived) ||
    (attempts < 50 && nextPageToken && !emptyPageReceived)
  ) {
    attempts += 1;
    const qp = new URLSearchParams({
      filter: "NOT trashed",
      pageSize: 200,
      pageToken: nextPageToken || "",
    });
    const result = await client.request({
      url: "https://keep.googleapis.com/v1/notes?" + qp.toString(),
      method: "GET",
    });
    if (result.data.nextPageToken) {
      nextPageToken = result.data.nextPageToken;
    } else {
      nextPageToken = undefined;
    }
    if (result.data.notes.length === 0) {
      emptyPageReceived = true;
    } else {
      rawNotes = rawNotes.concat(result.data.notes);
    }
  }

  const { data: cachedNotes } = await sbClient
    .from("notes")
    .select("id, raw")
    .eq("user_id", user.id)
    .limit(1000);

  const knownNames = cachedNotes.map((n) => n.raw.name);
  let nameMapping = {};
  cachedNotes.forEach((note) => {
    nameMapping[note.raw.name] = note;
  });
  const toCreate = rawNotes
    .filter((note) => !knownNames.includes(note.name))
    .map((raw) => ({
      raw,
      user_id: user.id,
    }));
  const toUpdate = rawNotes
    .filter((raw) => {
      const cached = nameMapping[raw.name];
      if (cached) {
        return raw !== cached.raw;
      } else {
        return false;
      }
    })
    .map((raw) => ({
      id: nameMapping[raw.name].id,
      raw,
      user_id: user.id,
    }));
  const upsertResult = await sbClient
    .from("notes")
    .upsert([...toCreate, ...toUpdate])
    .select();

  // deletes notes not found in remote
  const rawNames = rawNotes.map((r) => r.name);
  const toDelete = cachedNotes.filter(
    (note) => !rawNames.includes(note.raw.name)
  );
  await sbClient
    .from("notes")
    .delete()
    .in(
      "id",
      toDelete.map((t) => t.id)
    );

  res.status(200).json({ result: "ok" });
});

app.put("/notes/:id", async (req, res) => {
  // return all notes

  const sbClient = makeSbClient(req);
  const authHeader = req.header("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data } = await sbClient.auth.getUser(token);
  const user = data.user;
  if (!user) {
    return res.status(400).json({ error: "Must be authenticated" });
  }

  const id = req.params.id;
  const client = makeGoogleClient(user.email);

  const { data: note } = await sbClient
    .from("notes")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single();
  const noteNameId = note.raw.name.replace("notes/", "");
  await client.request({
    url: `https://keep.googleapis.com/v1/notes/${noteNameId}`,
    method: "DELETE",
  });

  const created = await client.request({
    url: "https://keep.googleapis.com/v1/notes",
    method: "POST",
    body: JSON.stringify(req.body),
  });

  const { data: updatedNote } = await sbClient
    .from("notes")
    .update({ raw: created.data })
    .eq("id", id)
    .select()
    .single();

  res.status(201).json(updatedNote);
});

app.post("/notes", async (req, res) => {
  // return all notes

  const sbClient = makeSbClient(req);
  const authHeader = req.header("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data } = await sbClient.auth.getUser(token);
  const user = data.user;
  if (!user) {
    return res.status(400).json({ error: "Must be authenticated" });
  }

  const { list_id, ...attrs } = req.body;
  const client = makeGoogleClient(user.email);
  const result = await client.request({
    url: `https://keep.googleapis.com/v1/notes`,
    method: "POST",
    body: JSON.stringify(attrs),
  });

  const cacheResult = await sbClient
    .from("notes")
    .insert({
      raw: result.data,
      user_id: user.id,
      list_id,
    })
    .select()
    .limit(1)
    .single();

  res.status(201).json(cacheResult);
});

app.delete("/notes/:id", async (req, res) => {
  // return all notes

  const sbClient = makeSbClient(req);
  const authHeader = req.header("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data } = await sbClient.auth.getUser(token);
  const user = data.user;
  if (!user) {
    return res.status(400).json({ error: "Must be authenticated" });
  }

  const id = req.params.id;

  const { data: note } = await sbClient
    .from("notes")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single();

  await sbClient.from("notes").delete(note.id);
  const client = makeGoogleClient(user.email);
  const result = await client.request({
    url: `https://keep.googleapis.com/v1/notes/${note.raw.name.replace(
      "notes/",
      ""
    )}`,
    method: "DELETE",
  });
  res.send("deleted");
});

// app.post("/notes", async (req, res) => {
//   // create a note
// });

// app.get("/notes/:id", async (req, res) => {
//   const id = req.params.id;
//   const task = {}; // get note

//   res.json(task);
// });

// app.patch("/notes/:id", async (req, res) => {
//   const id = req.params.id;
//   // modify task
// });

// app.delete("/tasks/:id", async (req, res) => {
//   const id = req.params.id;
//   // delete task
// });

const makeSbClient = (req) => {
  const authHeader = req.header("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
  return supabaseClient;
};

const makeGoogleClient = (email: string) => {
  const KEY = JSON.parse(Deno.env.get("GOOGLE_JWT"));
  const client = auth.fromJSON(KEY);
  client.scopes = ["https://www.googleapis.com/auth/keep"];
  client.subject = email;
  return client;
};

// Deno.serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   console.log(res);

//   return new Response(JSON.stringify(res.data), {
//     headers: { "Content-Type": "application/json" },
//   });
// });

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/notes' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' 
*/

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
