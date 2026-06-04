import { z } from "zod";

export const refreshSessionRequestSchema = z.object({
  refreshToken: z.string().trim().min(10)
});

export type RefreshSessionRequestDto = z.infer<typeof refreshSessionRequestSchema>;
