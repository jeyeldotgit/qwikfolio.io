import supabase from "@/lib/supabase";

export const uploadAvatar = async (
  userId: string,
  file: File
): Promise<string | null> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(data.path);

  return publicUrl;
};

export const deleteAvatar = async (filePath: string): Promise<void> => {
  const fileName = filePath.split("/").pop();
  if (!fileName) return;

  await supabase.storage.from("avatars").remove([fileName]);
};

