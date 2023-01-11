import ReactDOM from "react-dom/client";
import { router } from "./App";
import "antd/dist/reset.css";
import "./index.css";
import Auth from "./components/Auth";
import { RouterProvider } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Auth.AuthProvider>
    <RouterProvider router={router} />
  </Auth.AuthProvider>
);
