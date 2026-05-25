import { z } from "zod";

export const findQuestionsQuerySchema = z.object({
  subjectId: z.string().min(1).optional(),
  topicId: z.string().min(1).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  type: z.enum(["OPEN_ANSWER", "MULTIPLE_CHOICE", "PROCEDURE", "FLASHCARD"]).optional()
});

export type FindQuestionsQueryDto = z.infer<typeof findQuestionsQuerySchema>;
