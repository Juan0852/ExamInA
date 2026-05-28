import { z } from "zod";

export const syncExamSessionActivityRequestSchema = z.object({
  elapsedSeconds: z.number().int().min(0).max(24 * 60 * 60)
});

export type SyncExamSessionActivityRequestDto = z.infer<typeof syncExamSessionActivityRequestSchema>;
