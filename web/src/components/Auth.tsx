import { Session } from "@supabase/gotrue-js";
import { Form as AntForm, Input, Space, Tabs } from "antd";
import Button from "@mui/material/Button";
import { ArrowLeft } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "wouter";
import {
  getSession,
  onAuthStateChange,
  requestPasswordReset,
  signInWithPassword,
  signIntoGoogle,
  signUp,
  updatePassword,
} from "../api/auth";
import { Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Google } from "@mui/icons-material";
import { SupabaseClient } from "@supabase/supabase-js";
import { client } from "../utils";
namespace Auth {
  export enum Mode {
    SIGN_IN = "sign_in",
    SIGN_UP = "sign_up",
    REQUEST_RESET = "request_rest",
    UPDATE_PASSWORD = "update_password",
  }
  interface Callbacks {
    cancelLoading: () => void;
  }
  interface Attrs {
    email: string;
    password: string;
  }
  interface FormProps {
    mode?: Mode;
    onSubmit: (mode: Mode, attrs: Attrs, cbs: Callbacks) => void;
  }

  export const Form: React.FC<FormProps> = () => {
    const handleGoogleSignIn = async () => {
      await signIntoGoogle()
      
    };

    return (
      <>
        <Button
          variant="contained"
          sx={{
            mt: 1,
            width: "100%",
          }}
          startIcon={<Google />}
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>
      </>
    );
  };

  //   State handling and API interface
  type AuthState = {
    session: Session | null;
    user: Session["user"] | null;
  };
  const defaultState: AuthState = { user: null, session: null };
  const AuthContext = React.createContext(defaultState);
  export const useAuth = () => useContext(AuthContext);
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [state, setState] = useState(defaultState);

    async function getSupabaseSession() {
      const { session } = await getSession();
      if (session) {
        setState({ session, user: session.user ?? null });
      }
    }

    useEffect(() => {
      getSupabaseSession();

      const { subscription } = onAuthStateChange(async (_event, session) => {
        if (session) {
          setState({ session, user: session.user ?? null });
        } else {
          setState(defaultState);
        }
      });

      return () => subscription.unsubscribe();
    }, []);

    return (
      <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
    );
  };

  export const AuthContainer = ({ mode }: { mode?: Mode }) => {
    const handleSubmit: FormProps["onSubmit"] = async (
      mode,
      attrs,
      callbacks
    ) => {
      switch (mode) {
        case Mode.SIGN_IN:
          const signInData = await signInWithPassword(attrs);
          callbacks.cancelLoading();
          break;
        case Mode.SIGN_UP:
          const signUpData = await signUp(attrs);
          callbacks.cancelLoading();
          break;
        case Mode.REQUEST_RESET:
          await requestPasswordReset(attrs.email);
          callbacks.cancelLoading();
          break;
        case Mode.UPDATE_PASSWORD:
          await updatePassword(attrs.password);
          callbacks.cancelLoading();
          break;
      }
    };
    return <Auth.Form mode={mode} onSubmit={handleSubmit} />;
  };
}
export default Auth;
