import React from "react";
import ReactDOM from "react-dom/client";
import App, { router } from "./App";
import "antd/dist/reset.css";
import "./index.css";
import { client } from "./utils";
import Auth from "./components/Auth";
import { RouterProvider } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Auth.AuthProvider>
    <RouterProvider router={router} />
  </Auth.AuthProvider>
);
