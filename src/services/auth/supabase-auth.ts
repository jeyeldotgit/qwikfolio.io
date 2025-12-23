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
      emailRedirectTo: `${import.meta.env.VITE_APP_URL}/dashboard`,
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
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error(error);
    return null;
  }
  return data.session ?? null;
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
