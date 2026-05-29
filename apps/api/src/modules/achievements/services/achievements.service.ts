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
import { NotificationsService } from "../../notifications/services/notifications.service";

export const ACHIEVEMENTS_REPOSITORY = Symbol("ACHIEVEMENTS_REPOSITORY");

@Injectable()
export class AchievementsService implements OnModuleInit {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ACHIEVEMENTS_REPOSITORY)
    private readonly achievementsRepository: AchievementsRepository,
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService
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

    for (const ach of newlyUnlockedAchievements) {
      await this.notificationsService.createNotification(
        userId,
        "ACHIEVEMENT_UNLOCK",
        "¡Nuevo logro desbloqueado!",
        `Has desbloqueado la medalla "${ach.title}".`,
        { achievementId: ach.id, achievementCode: ach.code }
      );
    }

    return newlyUnlockedAchievements.map(AchievementMapper.toResponse);
  }

  async findMine(authorizationHeader?: string): Promise<AchievementsResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    
    // Evaluate achievements so stats are updated before retrieving them (e.g. visiting ProfilePage)
    const newlyUnlockedAchievements = await this.evaluateForUser(user.id);

    const achievements = await this.achievementsRepository.findAllForUser(user.id);

    return {
      data: achievements.map(AchievementMapper.toResponse),
      meta: {
        total: achievements.length,
        newlyUnlockedAchievements
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

    if (stats.acceptedFriendships >= 10) {
      eligibleCodes.push("CONNECTION_10");
    }

    if (stats.completedExamSessions >= 10) {
      eligibleCodes.push("EXAMS_10");
    }

    if (stats.completedExamSessions >= 50) {
      eligibleCodes.push("EXAMS_50");
    }

    if (stats.completedExamSessions >= 100) {
      eligibleCodes.push("EXAMS_100");
    }

    if (stats.createdSharedExams >= 10) {
      eligibleCodes.push("EXAMS_CREATED_10");
    }

    if (stats.totalStudyTimeSeconds >= 3600) {
      eligibleCodes.push("STUDY_1_HOUR");
    }

    if (stats.totalStudyTimeSeconds >= 36000) {
      eligibleCodes.push("STUDY_10_HOURS");
    }

    if (stats.totalStudyTimeSeconds >= 180000) {
      eligibleCodes.push("STUDY_50_HOURS");
    }

    if (stats.perfectExamsCount > 0) {
      eligibleCodes.push("PERFECT_EXAM");
    }

    if (stats.hasPerfectAnswer) {
      eligibleCodes.push("PERFECT_ANSWER");
    }

    if (stats.hasGreatAnswer) {
      eligibleCodes.push("GREAT_ANSWER");
    }

    if (stats.hasNightOwl) {
      eligibleCodes.push("SECRET_NIGHT_OWL");
    }

    if (stats.hasSundayStudy) {
      eligibleCodes.push("SECRET_SUNDAY_STUDY");
    }

    if (stats.hasMathPerfectAnswer) {
      eligibleCodes.push("SECRET_PERFECTIONIST");
    }

    return eligibleCodes;
  }
}
