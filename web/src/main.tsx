import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./components/Auth";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/patua-one";
import ReactGA from "react-ga4";

ReactGA.initialize([
  {
    trackingId: "G-495C5KQ4Q9",
    gaOptions: { anonymizeIp: true },
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
