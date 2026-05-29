import { z } from "zod";

export const evaluateWrittenAnswerRequestSchema = z.object({
  questionId: z.string().min(1),
  userAnswer: z.string().trim().max(8000),
  examSessionId: z.string().min(1).optional(),
  timeSpentSeconds: z.number().int().min(0).max(3600).optional(),
  attachmentIds: z.array(z.string().min(1)).max(3).optional()
}).refine(
  (data) => {
    const hasAttachments = data.attachmentIds && data.attachmentIds.length > 0;
    const hasAnswerText = data.userAnswer.trim().length >= 8;
    return hasAttachments || hasAnswerText;
  },
  {
    message: "Debes escribir una respuesta de al menos 8 caracteres o adjuntar una imagen/tablero.",
    path: ["userAnswer"]
  }
);

export type EvaluateWrittenAnswerRequestDto = z.infer<typeof evaluateWrittenAnswerRequestSchema>;
