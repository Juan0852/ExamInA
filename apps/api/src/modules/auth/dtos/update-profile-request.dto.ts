import { z } from "zod";

export const updateProfileRequestSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores.")
    .optional(),
  bio: z.string().trim().max(240).optional(),
  targetUniversity: z.string().trim().max(100).optional(),
  photoUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  bannerUrl: z.string().trim().url().max(500).optional().or(z.literal(""))
});

export type UpdateProfileRequestDto = z.infer<typeof updateProfileRequestSchema>;
