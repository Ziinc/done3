import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";
import "./index.css";
import Auth from "./components/Auth";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Auth.AuthProvider>
    <App />
  </Auth.AuthProvider>
);
