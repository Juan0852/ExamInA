export type AchievementCode =
  | "PROFILE_80"
  | "FIRST_EXAM_COMPLETED"
  | "FIRST_EXAM_CREATED"
  | "FIRST_STREAK_DAY"
  | "STREAK_7_DAYS"
  | "FIRST_ANSWER"
  | "FIRST_COMMUNITY_POST"
  | "FIRST_CONNECTION";

export type AchievementCatalogItem = {
  code: AchievementCode;
  title: string;
  description: string;
  icon: string;
  experienceReward: number;
};

export type AchievementEntity = AchievementCatalogItem & {
  id: string;
  unlocked: boolean;
  unlockedAt: string | null;
};
