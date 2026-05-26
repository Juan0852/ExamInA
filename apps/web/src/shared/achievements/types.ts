export type AchievementCode =
  | "PROFILE_80"
  | "FIRST_EXAM_COMPLETED"
  | "FIRST_EXAM_CREATED"
  | "FIRST_STREAK_DAY"
  | "STREAK_7_DAYS"
  | "FIRST_ANSWER"
  | "FIRST_COMMUNITY_POST"
  | "FIRST_CONNECTION";

export interface Achievement {
  id: string;
  code: AchievementCode;
  title: string;
  description: string;
  icon: string;
  experienceReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementsResponse {
  data: Achievement[];
  meta: {
    total: number;
    newlyUnlockedAchievements?: Achievement[];
  };
  error: null;
}
