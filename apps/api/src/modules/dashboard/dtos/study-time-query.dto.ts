import { z } from "zod";

export const studyTimeQuerySchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })
  .refine((value) => value.from <= value.to, {
    message: "from must be before or equal to to",
    path: ["from"]
  });

export type StudyTimeQueryDto = z.infer<typeof studyTimeQuerySchema>;
