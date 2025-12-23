import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getCurrentSession,
  signOut as supabaseSignOut,
  subscribeToAuthChanges,
} from "@/services/auth/supabase-auth";
import supabase from "@/lib/supabase";

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
    let hasInitialized = false;
    let currentSession: Session | null = null;

    // Use onAuthStateChange which fires immediately with INITIAL_SESSION
    const unsubscribe = subscribeToAuthChanges(async (session) => {
      if (!isMounted) return;

      // Prevent unnecessary state updates if session hasn't actually changed
      if (
        session?.access_token === currentSession?.access_token &&
        hasInitialized
      ) {
        return;
      }

      currentSession = session;

      if (session) {
        setState({
          status: "authenticated",
          user: session.user,
          session,
        });
        hasInitialized = true;
      } else {
        // Check if there's a user without a session (email confirmation pending)
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user && !userData.user.email_confirmed_at) {
          // User exists but email not confirmed - treat as unauthenticated
          // Clear the user data since they can't access protected routes
          await supabase.auth.signOut();
          setState({
            status: "unauthenticated",
            user: null,
            session: null,
          });
        } else {
          setState({
            status: "unauthenticated",
            user: null,
            session: null,
          });
        }
        hasInitialized = true;
      }
    });

    // Fallback: if onAuthStateChange doesn't fire quickly enough, check manually
    const fallbackCheck = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!isMounted || hasInitialized) return;

      const session = await getCurrentSession();

      if (!isMounted) return;

      currentSession = session;

      if (session) {
        setState({
          status: "authenticated",
          user: session.user,
          session,
        });
      } else {
        // Check if user exists but email not confirmed
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user && !userData.user.email_confirmed_at) {
          // User exists but email not confirmed - sign them out
          await supabase.auth.signOut();
        }

        setState({
          status: "unauthenticated",
          user: null,
          session: null,
        });
      }
    };

    fallbackCheck();

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
    throw new Error(
      "useAuthSession must be used within an AuthSessionProvider"
    );
  }

  return context;
};
