import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getCurrentSession,
  signOut as supabaseSignOut,
  subscribeToAuthChanges,
} from "@/services/auth/supabase-auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthSessionState = {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
};

type AuthSessionContextValue = AuthSessionState & {
  signOut: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(
  undefined
);

type AuthSessionProviderProps = {
  children: ReactNode;
};

export const AuthSessionProvider = ({ children }: AuthSessionProviderProps) => {
  const [state, setState] = useState<AuthSessionState>({
    status: "loading",
    user: null,
    session: null,
  });

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const session = await getCurrentSession();

      if (!isMounted) return;

      if (session) {
        setState({
          status: "authenticated",
          user: session.user,
          session,
        });
      } else {
        setState({
          status: "unauthenticated",
          user: null,
          session: null,
        });
      }
    };

    init();

    const unsubscribe = subscribeToAuthChanges((session) => {
      if (!isMounted) return;

      if (session) {
        setState({
          status: "authenticated",
          user: session.user,
          session,
        });
      } else {
        setState({
          status: "unauthenticated",
          user: null,
          session: null,
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabaseSignOut();
    setState({
      status: "unauthenticated",
      user: null,
      session: null,
    });
  };

  return (
    <AuthSessionContext.Provider
      value={{
        ...state,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
};

export const useAuthSession = (): AuthSessionContextValue => {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }

  return context;
};


