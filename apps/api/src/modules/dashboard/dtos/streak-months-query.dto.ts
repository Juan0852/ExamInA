import { z } from "zod";

export const streakMonthsQuerySchema = z.object({
  cursor: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(6).default(1)
});

export type StreakMonthsQueryDto = z.infer<typeof streakMonthsQuerySchema>;
