import { z } from "zod";

export const findTopicsQuerySchema = z.object({
  subjectId: z.string().min(1).optional()
});

export type FindTopicsQueryDto = z.infer<typeof findTopicsQuerySchema>;
