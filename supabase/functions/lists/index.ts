// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { auth, GoogleAuth } from "npm:google-auth-library";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import express from "npm:express@4.18.2";
import cors from "npm:cors";
import {
  insertTaskList,
  listTaskLists,
  getTaskList,
  deleteTaskList,
  patchTaskList,
  listAllTaskLists,
} from "./gapi.ts";
import { listTasks, listAllTasks } from "../tasks/gapi.ts";
import { setupServer } from "../_utils/server.ts";
import { createSbClient, createGapiClient, getUser } from "../_utils/auth.ts";

const app = setupServer();

app.post("/lists", async (req, res) => {
  const supabase = createSbClient(req);
  const { data: userData } = await getUser(req, supabase);
  const user = userData.user;
  const client = createGapiClient(user.email);
  const { data: raw } = await insertTaskList(client, req.body);
  const result = await supabase
    .from("lists")
    .insert({ raw, user_id: user.id })
    .select()
    .limit(1)
    .single();

  res.status(201).json(result.data);
});

// update a list
app.put("/lists/:id", async (req, res) => {
  const id = req.params.id;
  const supabase = createSbClient(req);
  const { data: userData } = await getUser(req, supabase);
  const user = userData.user;
  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single();

  const client = createGapiClient(user.email);
  console.log("email: ", user.email);
  console.log("list: ", list);
  console.log("list id: ", list.raw.id);
  console.log("body: ", req.body);
  const { data: raw } = await patchTaskList(client, list.raw.id, req.body);

  const { data } = await supabase
    .from("lists")
    .update({ raw, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  console.log("data", data);

  res.status(200).json(data);
});

app.delete("/lists/:id", async (req, res) => {
  const id = req.params.id;
  const supabase = createSbClient(req);
  const { data: userData } = await getUser(req, supabase);
  const user = userData.user;
  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const client = createGapiClient(user.email);
  const { data: raw } = await deleteTaskList(client, list.raw.id);

  const { error } = await supabase.from("lists").delete().eq("id", id);

  if (error) {
    throw new Error(error);
  }

  res.status(204).json();
});

// create db tasks if not existing.
// delete off db tasks that do not exist.
app.post("/lists/sync", async (req, res) => {
  let inserted = 0;
  let deleted = 0;
  let updated = 0;
  let completed = 0;
  const supabase = createSbClient(req);
  const { data: userData } = await getUser(req, supabase);
  const user = userData.user;
  if (!user) {
    return res.status(400).json({ error: "Must be authenticated" });
  }

  const client = createGapiClient(user.email);

  // fetch all lists
  const rawLists = await listAllTaskLists(client);
  console.log("rawLists length: ", rawLists.length);
  // fetch all cached lists
  const { data: cachedLists } = await supabase
    .from("lists")
    .select("*")
    .limit(1000);

  let seenListIds = [];
  let seenTaskIds = [];
  for (const rawList of rawLists) {
    console.log("cachedLists length", cachedLists.length);
    let cachedList = cachedLists.find((l) => l.raw.id == rawList.id);
    console.log("rawList id, cached id: ", rawList.id, cachedList?.id);

    if (!cachedList) {
      // create a cached list
      const result = await supabase
        .from("lists")
        .insert({ raw: rawList, user_id: user.id })
        .select()
        .limit(1)
        .single();
      console.log("created new cached list:", result.data.id);
      cachedList = result.data;
    }
    seenListIds.push(cachedList.id);
    const rawTasks = await listAllTasks(client, rawList.id);
    const rawTaskIds = rawTasks.map((r) => r.id);

    const { data: cachedTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("list_id", cachedList.id)
      .limit(1000);

    const cachedTaskRawIds = (cachedTasks || []).map((t) => t.raw.id);
    console.log("cachedTaskRawIds", cachedTaskRawIds);
    const toUpsert = rawTasks
      .filter((raw) => !cachedTaskRawIds.includes(raw.id))
      .map((raw) => ({
        raw,
        user_id: user.id,
        list_id: cachedList.id,
      }));

    // create the tasks
    console.log("toUpsert len", toUpsert.length);
    if (toUpsert.length > 0) {
      await supabase.from("tasks").upsert(toUpsert);
    }

    // delete the tasks
    const toDelete = cachedTasks.filter((t) => !rawTaskIds.includes(t.raw.id));
    console.log("toDelete len", toDelete.length);
    await supabase
      .from("tasks")
      .delete()
      .in(
        "id",
        toDelete.map((t) => t.id)
      );
    }
  
    // delete lists that are not on remote
    const rawListIds = rawLists.map(r=> r.id)
    const listsToDelete = cachedLists.filter(l=> !rawListIds.includes(l.raw.id))
    console.log("listsToDelete len", listsToDelete.length);
    await supabase
    .from("lists")
    .delete()
    .in(
      "id",
      listsToDelete.map((t) => t.id)
    );

    res.status(201).json({
    inserted,
    deleted,
    updated,
    completed,
  });
});
