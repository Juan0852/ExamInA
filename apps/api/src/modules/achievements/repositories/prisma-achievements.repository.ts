import { Inject, Injectable } from "@nestjs/common";
import { FriendshipStatus, ExamSessionStatus } from "@prisma/client";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { AchievementCatalogItem, AchievementCode } from "../entities/achievement.entity";
import type {
  AchievementEvaluationStats,
  AchievementsRepository,
  AchievementWithUnlock
} from "./achievements.repository";

@Injectable()
export class PrismaAchievementsRepository implements AchievementsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async syncCatalog(catalog: AchievementCatalogItem[]): Promise<void> {
    const prisma = this.prismaService.getClient();

    await Promise.all(
      catalog.map((achievement) =>
        prisma.achievement.upsert({
          where: { code: achievement.code },
          update: {
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            experienceReward: achievement.experienceReward
          },
          create: achievement
        })
      )
    );
  }

  async findAllForUser(userId: string): Promise<AchievementWithUnlock[]> {
    return this.prismaService.getClient().achievement.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        users: {
          where: { userId },
          select: { unlockedAt: true }
        }
      }
    });
  }

  async findExistingUserAchievementCodes(userId: string): Promise<AchievementCode[]> {
    const userAchievements = await this.prismaService.getClient().userAchievement.findMany({
      where: { userId },
      select: {
        achievement: {
          select: {
            code: true
          }
        }
      }
    });

    return userAchievements.map((userAchievement) => userAchievement.achievement.code as AchievementCode);
  }

  async findEvaluationStats(userId: string): Promise<AchievementEvaluationStats> {
    const prisma = this.prismaService.getClient();
    const [
      user,
      completedExamSessions,
      createdSharedExams,
      attempts,
      examAnswers,
      communityPosts,
      sentAcceptedFriendships,
      receivedAcceptedFriendships
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          photoUrl: true,
          profile: {
            select: {
              username: true,
              bio: true,
              avatarFileId: true,
              currentStreakDays: true
            }
          }
        }
      }),
      prisma.examSession.count({
        where: {
          userId,
          status: ExamSessionStatus.COMPLETED
        }
      }),
      prisma.sharedExam.count({
        where: { ownerId: userId }
      }),
      prisma.attempt.count({
        where: { userId }
      }),
      prisma.examSessionAnswer.count({
        where: {
          examSession: {
            userId
          }
        }
      }),
      prisma.communityPost.count({
        where: { authorId: userId }
      }),
      prisma.friendship.count({
        where: {
          requesterId: userId,
          status: FriendshipStatus.ACCEPTED
        }
      }),
      prisma.friendship.count({
        where: {
          receiverId: userId,
          status: FriendshipStatus.ACCEPTED
        }
      })
    ]);

    const hasName = Boolean(user?.profile?.username);
    const hasBio = (user?.profile?.bio?.trim().length ?? 0) >= 24;
    const hasAvatar = Boolean(user?.photoUrl || user?.profile?.avatarFileId);
    const profileCompletion = (hasName ? 40 : 0) + (hasBio ? 40 : 0) + (hasAvatar ? 20 : 0);

    return {
      profileCompletion,
      completedExamSessions,
      createdSharedExams,
      currentStreakDays: user?.profile?.currentStreakDays ?? 0,
      attempts,
      examAnswers,
      communityPosts,
      acceptedFriendships: sentAcceptedFriendships + receivedAcceptedFriendships
    };
  }

  async unlockAchievements(userId: string, codes: AchievementCode[]): Promise<AchievementWithUnlock[]> {
    if (codes.length === 0) {
      return [];
    }

    const prisma = this.prismaService.getClient();
    const achievements = await prisma.achievement.findMany({
      where: {
        code: {
          in: codes
        }
      },
      select: {
        id: true,
        code: true,
        experienceReward: true
      }
    });

    if (achievements.length === 0) {
      return [];
    }

    const createdAchievementIds: string[] = [];
    let totalExperienceReward = 0;

    await prisma.$transaction(async (transaction) => {
      for (const achievement of achievements) {
        const existing = await transaction.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id
            }
          },
          select: { id: true }
        });

        if (existing) {
          continue;
        }

        await transaction.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        });

        createdAchievementIds.push(achievement.id);
        totalExperienceReward += achievement.experienceReward;
      }

      if (totalExperienceReward > 0) {
        await transaction.userProgress.upsert({
          where: { userId },
          update: {
            experience: {
              increment: totalExperienceReward
            }
          },
          create: {
            userId,
            experience: totalExperienceReward
          }
        });

        await transaction.userProfile.update({
          where: { userId },
          data: {
            experience: {
              increment: totalExperienceReward
            }
          }
        });
      }
    });

    if (createdAchievementIds.length === 0) {
      return [];
    }

    return prisma.achievement.findMany({
      where: {
        id: {
          in: createdAchievementIds
        }
      },
      orderBy: { createdAt: "asc" },
      include: {
        users: {
          where: { userId },
          select: { unlockedAt: true }
        }
      }
    });
  }
}
