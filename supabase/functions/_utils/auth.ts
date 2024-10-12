import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { auth, GoogleAuth } from "npm:google-auth-library";
import { Request } from "npm:express";

export const createSbClient = (req: Request) => {
  const authHeader = req.header("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
  return supabaseClient;
};

export const createGapiClient = (email: string) => {
  const KEY = JSON.parse(Deno.env.get("GOOGLE_JWT"));
  const client = auth.fromJSON(KEY);
  client.scopes = [
    "https://www.googleapis.com/auth/keep",
    "https://www.googleapis.com/auth/tasks",
  ];
  client.subject = email;
  return client;
};

export const getUser = async (req: Request, sbClient: any) => {
  const authHeader = req.header("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  return await sbClient.auth.getUser(token);
};
