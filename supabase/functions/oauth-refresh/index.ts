import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data } = await supabaseClient.auth.getUser(token);
  const user = data.user;
  console.log('session', data.session);

  const jsonData = await req.json();
  const body = new URLSearchParams({
    client_id: Deno.env.get("GOOGLE_CLIENT_ID"),
    client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET"),
    grant_type: "refresh_token",
    refresh_token: jsonData?.provider_refresh_token,
  }).toString();
  console.log("body", body);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });
  const res = await response.json();
  console.log(res);

  return new Response(JSON.stringify(res), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: response.status,
  });
});
