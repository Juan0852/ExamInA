import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { AuthService } from "../../auth/services/auth.service";
import type {
  AchievementEvaluationResponseDto,
  AchievementResponseDto,
  AchievementsResponseDto
} from "../dtos/achievement-response.dto";
import type { AchievementCode } from "../entities/achievement.entity";
import { AchievementMapper } from "../mappers/achievement.mapper";
import type { AchievementsRepository, AchievementEvaluationStats } from "../repositories/achievements.repository";
import { ACHIEVEMENT_CATALOG } from "./achievement-catalog";

export const ACHIEVEMENTS_REPOSITORY = Symbol("ACHIEVEMENTS_REPOSITORY");

@Injectable()
export class AchievementsService implements OnModuleInit {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ACHIEVEMENTS_REPOSITORY)
    private readonly achievementsRepository: AchievementsRepository
  ) {}

  async onModuleInit() {
    await this.achievementsRepository.syncCatalog(ACHIEVEMENT_CATALOG);
  }

  async evaluateForUser(userId: string): Promise<AchievementResponseDto[]> {
    await this.achievementsRepository.syncCatalog(ACHIEVEMENT_CATALOG);
    const [existingCodes, stats] = await Promise.all([
      this.achievementsRepository.findExistingUserAchievementCodes(userId),
      this.achievementsRepository.findEvaluationStats(userId)
    ]);
    const existingCodeSet = new Set(existingCodes);
    const eligibleCodes = this.getEligibleCodes(stats).filter((code) => !existingCodeSet.has(code));
    const newlyUnlockedAchievements = await this.achievementsRepository.unlockAchievements(
      userId,
      eligibleCodes
    );
    return newlyUnlockedAchievements.map(AchievementMapper.toResponse);
  }

  async findMine(authorizationHeader?: string): Promise<AchievementsResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    
    // Evaluate achievements so stats are updated before retrieving them (e.g. visiting ProfilePage)
    await this.evaluateForUser(user.id);

    const achievements = await this.achievementsRepository.findAllForUser(user.id);

    return {
      data: achievements.map(AchievementMapper.toResponse),
      meta: {
        total: achievements.length
      },
      error: null
    };
  }

  async evaluateMine(authorizationHeader?: string): Promise<AchievementEvaluationResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const newlyUnlockedAchievements = await this.evaluateForUser(user.id);
    const achievements = await this.achievementsRepository.findAllForUser(user.id);

    return {
      data: achievements.map(AchievementMapper.toResponse),
      meta: {
        newlyUnlockedAchievements
      },
      error: null
    };
  }

  private getEligibleCodes(stats: AchievementEvaluationStats): AchievementCode[] {
    const eligibleCodes: AchievementCode[] = [];

    if (stats.profileCompletion >= 80) {
      eligibleCodes.push("PROFILE_80");
    }

    if (stats.completedExamSessions > 0) {
      eligibleCodes.push("FIRST_EXAM_COMPLETED");
    }

    if (stats.createdSharedExams > 0) {
      eligibleCodes.push("FIRST_EXAM_CREATED");
    }

    if (stats.currentStreakDays > 0) {
      eligibleCodes.push("FIRST_STREAK_DAY");
    }

    if (stats.currentStreakDays >= 7) {
      eligibleCodes.push("STREAK_7_DAYS");
    }

    if (stats.attempts > 0 || stats.examAnswers > 0) {
      eligibleCodes.push("FIRST_ANSWER");
    }

    if (stats.communityPosts > 0) {
      eligibleCodes.push("FIRST_COMMUNITY_POST");
    }

    if (stats.acceptedFriendships > 0) {
      eligibleCodes.push("FIRST_CONNECTION");
    }

    return eligibleCodes;
  }
}
