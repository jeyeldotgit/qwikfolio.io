import supabase from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

type EmailAuthPayload = {
  email: string;
  password: string;
};

export const signUpWithEmail = async (
  formData: EmailAuthPayload
): Promise<{ user: User | null; session: Session | null } | null> => {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${import.meta.env.VITE_APP_URL}/onboarding`,
    },
  });

  if (error) {
    console.error(error);
    return null;
  }

  return {
    user: data.user,
    session: data.session,
  };
};

export const signInWithEmail = async (
  formData: EmailAuthPayload
): Promise<{ user: User | null; session: Session | null } | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return {
    user: data.user,
    session: data.session,
  };
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error(error);
    return null;
  }
  return data.user ?? null;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    // getSession() reads from localStorage and returns the current session
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    // If session exists and is valid, return it
    if (data?.session) {
      return data.session;
    }

    // If no session but we might have a token, try getUser() to validate
    // This will throw if token is invalid/expired
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      // Token is invalid/expired, clear it
      console.error("User token invalid:", userError);
      await supabase.auth.signOut();
      return null;
    }

    // If we have a user but no session, the session might have expired
    // Try to refresh it
    if (userData?.user) {
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("Error refreshing session:", refreshError);
        return null;
      }

      return refreshData?.session ?? null;
    }

    return null;
  } catch (error) {
    console.error("Unexpected error in getCurrentSession:", error);
    return null;
  }
};

export const subscribeToAuthChanges = (
  callback: (session: Session | null) => void
): (() => void) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => {
    data.subscription.unsubscribe();
  };
};
