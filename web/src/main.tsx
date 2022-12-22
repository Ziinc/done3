import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";
import "./index.css";
import { Auth } from "@supabase/auth-ui-react";
import { client } from "./utils";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Auth.UserContextProvider supabaseClient={client}>
      <App />
    </Auth.UserContextProvider>
  </React.StrictMode>
);
