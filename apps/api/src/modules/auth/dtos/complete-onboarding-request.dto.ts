import { z } from "zod";

const prismaIdSchema = z.string().trim().min(1).max(50);

export const completeOnboardingRequestSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  bio: z.string().trim().max(240).optional(),
  targetUniversity: z.string().trim().max(100).optional(),
  photoUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  preferredSubjects: z.array(prismaIdSchema).min(1, "Select at least one subject"),
  weeklyStudyHours: z.string().optional().nullable(),
  referralSource: z.string().optional().nullable(),
});

export type CompleteOnboardingRequestDto = z.infer<typeof completeOnboardingRequestSchema>;
