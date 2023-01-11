import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import { checkAuthed } from "./api/auth";
import { Transition } from "@headlessui/react";
import CenteredLayout from "./layouts/CenteredLayout";
import LoadingSpinner from "./components/LoadingSpinner";
import Auth from "./components/Auth";
import {
  Route,
  BrowserRouter,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

function App() {
  const user = Auth.useAuth();
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
        <AuthWall showLoading={showLoading} />
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

export const ResetPassword = () => {
  return (
    <CenteredLayout className="bg-violet-50">
      <Transition
        show={true}
        className="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="bg-slate-50 p-4 rounded-xl border-solid border-b-2 border-t-0 border-l-0 border border-pink-500">
          <Auth.AuthContainer mode={Auth.Mode.UPDATE_PASSWORD} />
        </div>
      </Transition>
    </CenteredLayout>
  );
};

export const AuthWall = ({ showLoading }: { showLoading: boolean }) => {
  const user = Auth.useAuth();

  return (
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
            <Auth.AuthContainer />
          </div>
        </Transition>
      </div>
    </CenteredLayout>
  );
};

export const AuthedApp = () => {
  return (
    <MainLayout className="bg-violet-50">
      <Home />
    </MainLayout>
  );
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="/" element={<App />} />
    </Route>
  ),
  {
    basename: import.meta.env.BASE_URL,
  }
);

export default App;
