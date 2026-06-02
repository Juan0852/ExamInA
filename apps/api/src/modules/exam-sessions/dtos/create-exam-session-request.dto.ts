import { z } from "zod";

export const createExamSessionRequestSchema = z.object({
  title: z.string().min(1).max(200),
  questionIds: z.array(z.string().min(1)).min(1).max(100),
  durationLimitSeconds: z.number().int().min(0).max(86400).optional()
});

export type CreateExamSessionRequestDto = z.infer<typeof createExamSessionRequestSchema>;
