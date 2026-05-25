import { z } from "zod";

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().trim().max(80).optional()
});

export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;
