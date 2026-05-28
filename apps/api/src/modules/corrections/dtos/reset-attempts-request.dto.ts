import { z } from "zod";

export const resetAttemptsRequestSchema = z.object({
  questionIds: z.array(z.string().min(1)).min(1)
});

export type ResetAttemptsRequestDto = z.infer<typeof resetAttemptsRequestSchema>;
