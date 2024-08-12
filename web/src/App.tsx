import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import { checkAuthed } from "./api/auth";
import CenteredLayout from "./layouts/CenteredLayout";
import LoadingSpinner from "./components/LoadingSpinner";
import { AuthContainer, useAuth } from "./components/Auth";
import { Route } from "wouter";
import { HashRouter } from "./router";
import {
  Container,
  Divider,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function App() {
  const user = useAuth();
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <HashRouter base={import.meta.env.BASE_URL}>
        <Route path="/">
          {(showLoading || !user.session) && (
            <AuthWall showLoading={showLoading} />
          )}
          {!showLoading && Boolean(user.session) && <AuthedApp />}
        </Route>
      </HashRouter>
    </LocalizationProvider>
  );
}

export const AuthWall = ({ showLoading }: { showLoading: boolean }) => {
  const user = useAuth();

  return (
    <CenteredLayout className="bg-violet-50">
      <div className="relative">
        {showLoading && <LoadingSpinner className="mx-auto my-auto" />}
        {!showLoading && !user.user && (
          <Stack direction="column" spacing={2}>
            <Container className="w-96">
              <Typography variant="h1" textAlign={"center"}>
                Done<sup>3</sup>
              </Typography>
              <Typography variant="subtitle1" textAlign={"left"}>
                The integrated dashboard for getting things done with Google
                Workspace.
              </Typography>
              <Typography variant="subtitle1" textAlign={"left"}>
                Alternative client for Google Tasks and Google Keep.
              </Typography>
            </Container>
            <Divider />
            <Typography variant="h5" textAlign={"center"}>
              Features
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Tasks Extended</Typography>
                  <ListItem>
                    <ListItemText primary="Kanvan view" />
                  </ListItem>
                </Paper>
              </Grid>
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Keep Extended</Typography>
                  <ListItem>
                    <ListItemText primary="Markdown editor" />
                  </ListItem>
                </Paper>
              </Grid>
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Counters</Typography>{" "}
                  <ListItem>
                    <ListItemText primary="Action counter" />
                  </ListItem>
                </Paper>
              </Grid>
            </Grid>
            <Divider />
            <AuthContainer />
          </Stack>
        )}
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
