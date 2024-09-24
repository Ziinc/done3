import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { auth, GoogleAuth } from "npm:google-auth-library";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import express from "npm:express@4.18.2";
import cors from "npm:cors";
import { insertTask, patchTask, moveTask, deleteTask } from "./gapi.ts";
import { setupServer } from "../_utils/server.ts";
import { createSbClient, createGapiClient, getUser } from "../_utils/auth.ts";
const app = setupServer();

// create a task
app.post("/tasks", async (req, res) => {
  const {list_id, ...attrs} = req.body
  const supabase = createSbClient(req);
  const { data: userData } = await getUser(req, supabase);
  const user = userData.user;
  const client = createGapiClient(user.email);
  const {data: list} = await supabase
    .from("lists")
    .select("*")
    .eq("id", list_id)
    .limit(1)
    .single();

  const {data: raw} = await insertTask(client, list.raw.id, attrs.task, req.body?.parent, req.body?.previous);

  const result = await supabase
    .from("tasks")
    .insert({ raw, user_id: user.id, list_id })
    .select()
    .limit(1)
    .single();

  res.status(201).json(result.data);
});

// update a task
app.patch("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const supabase = createSbClient(req);
  const { data: userData } = await getUser(req, supabase);
  const user = userData.user;

  const {data: task} =  await supabase
  .from("tasks")
  .select("*, list:lists (*) ")
  .eq("id", id)
  .limit(1)
  .single();

  const client = createGapiClient(user.email);
  const {data: raw} = await patchTask(client, task.list.raw.id, task.raw.id, req.body);
  const { data } = await supabase
    .from("tasks")
    .update({ raw, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  res.status(204).json(null);
});

// update a task
app.delete("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const supabase = createSbClient(req);
  const { data: userData } = await getUser(req, supabase);
  const user = userData.user;

  const { data: task } = await supabase
    .from("tasks")
    .select("*, list:lists (*) ")
    .eq("id", id)
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const client = createGapiClient(user.email);
  const { data: raw } = await deleteTask(client, task.list.raw.id, task.raw.id);

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    throw new Error(error);
  }

  res.status(204).json();
});
