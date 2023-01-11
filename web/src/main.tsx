import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";
import "./index.css";
import Auth from "./components/Auth";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Auth.AuthProvider>
    <App />
  </Auth.AuthProvider>
);
