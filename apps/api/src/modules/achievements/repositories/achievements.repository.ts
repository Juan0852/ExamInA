import type { Achievement, UserAchievement } from "@prisma/client";
import type { AchievementCatalogItem, AchievementCode } from "../entities/achievement.entity";

export type AchievementWithUnlock = Achievement & {
  users: Pick<UserAchievement, "unlockedAt">[];
};

export type AchievementEvaluationStats = {
  profileCompletion: number;
  completedExamSessions: number;
  createdSharedExams: number;
  currentStreakDays: number;
  attempts: number;
  examAnswers: number;
  communityPosts: number;
  acceptedFriendships: number;
  
  totalStudyTimeSeconds: number;
  perfectExamsCount: number;
  hasPerfectAnswer: boolean;
  hasGreatAnswer: boolean;
  hasMathPerfectAnswer: boolean;
  hasNightOwl: boolean;
  hasSundayStudy: boolean;
};

export interface AchievementsRepository {
  syncCatalog(catalog: AchievementCatalogItem[]): Promise<void>;
  findAllForUser(userId: string): Promise<AchievementWithUnlock[]>;
  findExistingUserAchievementCodes(userId: string): Promise<AchievementCode[]>;
  findEvaluationStats(userId: string): Promise<AchievementEvaluationStats>;
  unlockAchievements(userId: string, codes: AchievementCode[]): Promise<AchievementWithUnlock[]>;
}
