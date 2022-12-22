import { Auth } from "@supabase/auth-ui-react";
import { client } from "./utils";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";

function App() {
  const user = Auth.useUser();

  if (!user.user) {
    return <Auth supabaseClient={client} />;
  } else {
    return <AuthedApp />;
  }
}

export const AuthedApp = () => {
  return (
    <MainLayout>
      <Home />
    </MainLayout>
  );
};

export default App;
