import { Session } from "@supabase/gotrue-js";
import { Button, Form as AntForm, Input, Space, Tabs } from "antd";
import { ArrowLeft } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "wouter";
import {
  getSession,
  onAuthStateChange,
  requestPasswordReset,
  signInWithPassword,
  signUp,
  updatePassword,
} from "../api/auth";
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

  export const Form: React.FC<FormProps> = ({
    mode: modeProp = Mode.SIGN_IN,
    onSubmit,
  }) => {
    const [mode, setMode] = useState(modeProp);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const handleSubmit = async (attrs: Attrs) => {
      setLoading(true);
      const callbacks = {
        cancelLoading: () => setLoading(false),
      };
      await onSubmit(mode, attrs, callbacks);
      if (mode === Mode.REQUEST_RESET) {
        setMsg("Password reset instructions has been sent your e-mail");
      } else if (mode === Mode.SIGN_UP) {
        setMsg("Confirmation instructions has been sent your e-mail");
      }
    };
    const isSigningInOrUp = mode === Mode.SIGN_IN || mode === Mode.SIGN_UP;

    useEffect(() => {
      setMsg("");
    }, [mode]);
    return (
      <>
        {isSigningInOrUp ? (
          <Tabs
            defaultActiveKey={Mode.SIGN_IN}
            size="middle"
            centered
            items={[
              {
                key: Mode.SIGN_IN,
                label: (
                  <span className="inline-block w-24 text-center">Sign In</span>
                ),
              },
              {
                key: Mode.SIGN_UP,
                label: (
                  <span className="inline-block w-24 text-center">Sign Up</span>
                ),
              },
            ]}
            onChange={(key) => setMode(key as Mode)}
          />
        ) : (
          <Space className=" pt-2 pb-4">
            <Link to="/" onClick={() => setMode(Mode.SIGN_IN)}>
              <Button type="text" icon={<ArrowLeft size={16} />}>
                Back to sign in
              </Button>
            </Link>
          </Space>
        )}
        <AntForm
          name={String(mode)}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleSubmit}
        >
          {(isSigningInOrUp || mode === Mode.REQUEST_RESET) && (
            <AntForm.Item
              label="Email"
              name="email"
              rules={[{ required: true }]}
            >
              <Input type="email" />
            </AntForm.Item>
          )}
          {(isSigningInOrUp || mode === Mode.UPDATE_PASSWORD) && (
            <AntForm.Item
              label="Password"
              name="password"
              rules={[{ required: true }]}
            >
              <Input type="password" />
            </AntForm.Item>
          )}
          <AntForm.Item wrapperCol={{ span: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="justify-center"
            >
              {mode === Mode.SIGN_IN && "Sign in"}
              {mode === Mode.SIGN_UP && "Sign up"}
              {mode === Mode.REQUEST_RESET &&
                "Send reset password instructions"}
              {mode === Mode.UPDATE_PASSWORD && "Confirm password change"}
            </Button>
          </AntForm.Item>
        </AntForm>
        {isSigningInOrUp && (
          <Button
            type="link"
            onClick={() => {
              setMode(Mode.REQUEST_RESET);
            }}
          >
            Forgot your password?
          </Button>
        )}
        {msg}
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
