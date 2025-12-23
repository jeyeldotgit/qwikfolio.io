import { z } from "zod";

export const profileSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),

  // identity / display
  full_name: z.string().nullable(),
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),

  // app metadata
  onboarding_completed: z.boolean(),
  last_seen_at: z.string().datetime().nullable(),
  plan: z.enum(["free", "pro"]).default("free"),
});

export type Profile = z.infer<typeof profileSchema>;

export const createProfileSchema = profileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateProfileSchema = profileSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
