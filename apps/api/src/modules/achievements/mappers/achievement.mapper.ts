import type { AchievementResponseDto } from "../dtos/achievement-response.dto";
import type { AchievementWithUnlock } from "../repositories/achievements.repository";

export class AchievementMapper {
  static toResponse(achievement: AchievementWithUnlock): AchievementResponseDto {
    const unlockedAt = achievement.users[0]?.unlockedAt ?? null;

    return {
      id: achievement.id,
      code: achievement.code as AchievementResponseDto["code"],
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon ?? achievement.code.toLowerCase(),
      experienceReward: achievement.experienceReward,
      unlocked: Boolean(unlockedAt),
      unlockedAt: unlockedAt?.toISOString() ?? null
    };
  }
}
