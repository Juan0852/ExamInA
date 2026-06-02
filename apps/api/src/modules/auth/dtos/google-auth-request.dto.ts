import { z } from "zod";

export const googleAuthRequestSchema = z.object({
  idToken: z.string().min(1)
});

export type GoogleAuthRequestDto = z.infer<typeof googleAuthRequestSchema>;
