import { z } from "zod";

export const createCommunityPostRequestSchema = z.object({
  type: z
    .enum(["TEXT", "QUESTION", "EXAM_RESULT", "PROGRESS_UPDATE", "TIP", "DOUBT"])
    .default("TEXT"),
  visibility: z.enum(["PUBLIC", "FRIENDS_ONLY", "PRIVATE"]).default("PUBLIC"),
  title: z.string().trim().min(1).max(140).optional(),
  content: z.string().trim().min(1).max(5000),
  examSessionId: z.string().min(1).optional()
});

export type CreateCommunityPostRequestDto = z.infer<typeof createCommunityPostRequestSchema>;
