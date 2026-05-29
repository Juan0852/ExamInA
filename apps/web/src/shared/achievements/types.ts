export type AchievementCode =
  | "PROFILE_80"
  | "FIRST_EXAM_COMPLETED"
  | "FIRST_EXAM_CREATED"
  | "FIRST_STREAK_DAY"
  | "STREAK_7_DAYS"
  | "FIRST_ANSWER"
  | "FIRST_COMMUNITY_POST"
  | "FIRST_CONNECTION"
  | "CONNECTION_10"
  | "EXAMS_10"
  | "EXAMS_50"
  | "EXAMS_100"
  | "EXAMS_CREATED_10"
  | "STUDY_1_HOUR"
  | "STUDY_10_HOURS"
  | "STUDY_50_HOURS"
  | "PERFECT_EXAM"
  | "PERFECT_ANSWER"
  | "GREAT_ANSWER"
  | "SECRET_NIGHT_OWL"
  | "SECRET_SUNDAY_STUDY"
  | "SECRET_PERFECTIONIST";

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
