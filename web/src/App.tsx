import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import { checkAuthed, refreshAccessTokens } from "./api/auth";
import { Transition } from "@headlessui/react";
import CenteredLayout from "./layouts/CenteredLayout";
import LoadingSpinner from "./components/LoadingSpinner";
import Auth from "./components/Auth";
import { Route } from "wouter";
import { HashRouter } from "./router";
import { Container, Divider, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

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
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const showLoading = !minLoadingWait || loading;

  return (
    <HashRouter base={import.meta.env.BASE_URL}>
      <Route path="/">
        <Transition
          show={showLoading || !user.session}
          className="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <AuthWall showLoading={showLoading} />
        </Transition>
        <Transition
          show={!showLoading && Boolean(user.session)}
          className="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <AuthedApp />
        </Transition>
      </Route>
      <Route path="/reset-password" component={ResetPassword} />
    </HashRouter>
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
        leaveTo="opacity-0">
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
      <div className="relative">
        <Transition
          show={showLoading}
          className="transition-opacity duration-300 absolute inset-0 flex"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <LoadingSpinner className="mx-auto my-auto" />
        </Transition>
        <Transition
          show={!showLoading && !user.user}
          className="transition-opacity delay-300 duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <Stack direction="column" spacing={2}>
            <Container className="w-96">
              <Typography variant="h1" textAlign={"center"}>
                Done<sup>3</sup>
              </Typography>
              <Typography variant="subtitle1" textAlign={"left"}>
                Your integrated dashboard for getting things done with Google
                Tasks
              </Typography>
            </Container>
            <Divider />
            <Typography variant="h6" textAlign={"center"}>
              Features
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Tasks+</Typography>
                  <Typography variant="body2">
                    Extended Tasks features
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Counters</Typography>
                  <Typography variant="body2">
                    Count-based metrics for Tasks and behaviours
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            <Divider />
            <Auth.AuthContainer />
          </Stack>
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

export default App;
