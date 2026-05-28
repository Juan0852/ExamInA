import { z } from "zod";

export const evaluateWrittenAnswerRequestSchema = z.object({
  questionId: z.string().min(1),
  userAnswer: z.string().trim().min(8).max(8000),
  examSessionId: z.string().min(1).optional(),
  timeSpentSeconds: z.number().int().min(0).max(3600).optional()
});

export type EvaluateWrittenAnswerRequestDto = z.infer<typeof evaluateWrittenAnswerRequestSchema>;
