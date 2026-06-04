import { z } from "zod";

export const streakMonthsQuerySchema = z.object({
  cursor: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  offset: z.coerce.number().int().min(0).max(120).default(0),
  limit: z.coerce.number().int().min(1).max(6).default(1)
});

export type StreakMonthsQueryDto = z.infer<typeof streakMonthsQuerySchema>;
