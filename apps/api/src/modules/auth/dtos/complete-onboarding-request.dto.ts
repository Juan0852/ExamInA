import { z } from "zod";

export const completeOnboardingRequestSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  bio: z.string().trim().max(160).optional(),
  targetUniversity: z.string().trim().max(100).optional(),
  photoUrl: z.string().trim().url().optional().or(z.literal("")),
  preferredSubjects: z.array(z.string().uuid()).min(1, "Select at least one subject"),
  weeklyStudyHours: z.string().optional().nullable(),
  referralSource: z.string().optional().nullable(),
});

export type CompleteOnboardingRequestDto = z.infer<typeof completeOnboardingRequestSchema>;
