import supabase from "@/lib/supabase";
import type {
  Profile,
  CreateProfileInput,
  UpdateProfileInput,
} from "@/schemas/profile";

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data as Profile | null;
};

export const createProfile = async (
  userId: string,
  input: CreateProfileInput
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      ...input,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    return null;
  }

  return data as Profile | null;
};

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }

  return data as Profile | null;
};
