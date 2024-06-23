import { createClient } from "@supabase/supabase-js";
import { upsertGoogleAuth } from "./api/auth";

const supabaseUrl = import.meta.env.VITE_API_URL;
const supabaseAnonKey = import.meta.env.VITE_ANON_KEY;

export const client = createClient(supabaseUrl, supabaseAnonKey);

client.auth.onAuthStateChange((event, session) => {
  if (session && session.provider_refresh_token && session.provider_token) {
    upsertGoogleAuth({
      access_token: session.provider_token,
      refresh_token: session.provider_refresh_token,
      expires_at: new Date(session.expires_at!).toISOString(),
    });
  }

  if (event === "SIGNED_OUT") {
    window.localStorage.removeItem("oauth_provider_token");
    window.localStorage.removeItem("oauth_provider_refresh_token");
    window.localStorage.removeItem("oauth_provider_expires_at");
  }
});
