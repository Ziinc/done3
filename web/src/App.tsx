import { Auth } from "@supabase/auth-ui-react";
import { client } from "./utils";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import { checkAuthed } from "./api/auth";
import { Loader2 } from "lucide-react";
import { Transition } from "@headlessui/react";
import CenteredLayout from "./layouts/CenteredLayout";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const user = Auth.useUser();
  const [minLoadingWait, setMinLoadingWait] = useState(false);
  const [loading, setLoading] = useState(true);
  const handleStartup = async () => {
    await checkAuthed();
    setLoading(false);
  };
  useEffect(() => {
    handleStartup();
    const timeout = setTimeout(() => {
      setMinLoadingWait(true);
    }, 600);
    return () => clearTimeout(timeout);
  }, []);

  const showLoading = !minLoadingWait || loading;

  return (
    <>
      <Transition
        show={showLoading || !user.session}
        className="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <CenteredLayout className="bg-violet-50">
          <div className="relative w-72 h-96">
            <Transition
              show={showLoading}
              className="transition-opacity duration-300 absolute inset-0 flex"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <LoadingSpinner className="mx-auto my-auto" />
            </Transition>
            <Transition
              show={!showLoading && !user.user}
              className="transition-opacity delay-300 duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="bg-slate-50 p-4 rounded-xl border-solid border-b-2 border-t-0 border-l-0 border border-pink-500">
                <Auth
                  supabaseClient={client}
                  appearance={{
                    className: {
                      anchor: "text-slate-800 my-1",
                      label: "py-1",
                      input:
                        "p-2 rounded border border-slate-600 focus:border-slate-800 focus:ring",
                      button:
                        "bg-emerald-700 hover:bg-emerald-600 text-white p-2 rounded rounded-xl focus:ring",
                    },
                  }}
                  localization={{
                    variables: {
                      sign_up: {
                        email_label: "Email",
                        email_input_placeholder: "John.Doe@example.com",
                        password_label: "Password",
                        password_input_placeholder: "●●●●●●●●",
                      },
                      sign_in: {
                        email_label: "Email",
                        email_input_placeholder: "John.Doe@example.com",
                        password_label: "Password",
                        password_input_placeholder: "●●●●●●●●",
                      },
                    },
                  }}
                />
              </div>
            </Transition>
          </div>
        </CenteredLayout>
      </Transition>
      <Transition
        show={!showLoading && Boolean(user.session)}
        className="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <AuthedApp />
      </Transition>
    </>
  );
}

export const AuthedApp = () => {
  return (
    <MainLayout className="bg-violet-50">
      <Home />
    </MainLayout>
  );
};

export default App;
