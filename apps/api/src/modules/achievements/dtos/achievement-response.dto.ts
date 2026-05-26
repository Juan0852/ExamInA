import type { AchievementEntity } from "../entities/achievement.entity";

export type AchievementResponseDto = AchievementEntity;

export type AchievementsResponseDto = {
  data: AchievementResponseDto[];
  meta: {
    total: number;
  };
  error: null;
};

export type AchievementEvaluationResponseDto = {
  data: AchievementResponseDto[];
  meta: {
    newlyUnlockedAchievements: AchievementResponseDto[];
  };
  error: null;
};
