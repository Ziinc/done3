import { GoTrueClient } from "@supabase/gotrue-js";
import { client } from "../utils";
import axios from "axios";
import { BrowserNotSupported, QrCodeScannerOutlined } from "@mui/icons-material";

export const signOut = () => {
  client.auth.signOut();
  localStorage.removeItem("sb-localhost-auth-token");
};

export const getUserId = async () => {
  const { data, error } = await client.auth.getSession();
  return data.session?.user.id;
};

export const getSession = async () => {
  const { data, error } = await client.auth.getSession();
  return data;
};

export const checkAuthed = async () => {
  const {error} = await client.auth.refreshSession();
  console.log(error)
  // const expiry  = window.localStorage.getItem('oauth_provider_expires_at')

  // const providerRefreshToken = window.localStorage.getItem('oauth_provider_refresh_token')
  // console.log('expiry', (Date.now()/ 1000) > Number(expiry))
  // if (result.data.session && providerRefreshToken && (expiry && (Date.now()/ 1000) > Number(expiry) == false) ){
  //   // refresh the
  //   // await axios.post("https://oauth2.googleapis.com/token")
  //   const res  = await client.functions.invoke("oauth-refresh", {body: {provider_refresh_token: providerRefreshToken}})
  //   console.log('edge func res', res)
  // }

  const {data} = await getGoogleAuth()
  if (data?.access_token) {
    window.localStorage.setItem("oauth_provider_token", data?.access_token);
  }
};

export const getGoogleAuth = async ()=>{
  return await client
    .from("google_auth")
    .select("access_token")
    .limit(1)
    .single();
}

export const upsertGoogleAuth = async (attrs: {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}) => {
  const userId = await getUserId();
  console.log('upsert attrs', attrs)
  const { data } = await client
    .from("google_auth")
    .upsert(
      { ...attrs, user_id: userId },
      {
        onConflict: "user_id",
      }
    )
    .select();
  console.log("upsertGoogleAuth", data);
};
export const signIntoGoogle = async () => {
  await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      scopes: [
        "...auth/userinfo.profile",
        "...auth/userinfo.email",
        "...auth/tasks",
        // "...auth/tasks.readonly",
      ]
        .map((str) => str.replace("...", "https://www.googleapis.com/"))
        .join(" "),
    },
  });
};
const setOauthProviderAccessToken = (session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in: number;
  token_type: string;
}) => {
  window.localStorage.setItem(
    "oauth_provider_refresh_token",
    session.refresh_token
  );
  window.localStorage.setItem(
    "oauth_provider_expires_at",
    String(session.expires_at)
  );
  window.localStorage.setItem("oauth_provider_token", session.access_token);
};

export const onAuthStateChange = (
  callback: Parameters<GoTrueClient["onAuthStateChange"]>[0]
) => {
  const { data } = client.auth.onAuthStateChange(callback);
  return data;
};

export const signUp = async (attrs: { email: string; password: string }) => {
  const { data } = await client.auth.signUp(attrs);
  return data;
};

export const signInWithPassword = async (attrs: {
  email: string;
  password: string;
}) => {
  const { data } = await client.auth.signInWithPassword(attrs);
  return data;
};
export const requestPasswordReset = async (email: string) => {
  const { data } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: "https://counters.tznc.net/app/#/reset-password",
  });
  return data;
};

export const updatePassword = async (password: string) => {
  const { data } = await client.auth.updateUser({ password });
  return data;
};
