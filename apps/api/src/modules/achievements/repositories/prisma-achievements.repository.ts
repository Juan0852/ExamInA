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

    for (const achievement of catalog) {
      await prisma.achievement.upsert({
        where: { code: achievement.code },
        update: {
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          experienceReward: achievement.experienceReward
        },
        create: achievement
      });
    }
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
              currentStreakDays: true,
              longestStreakDays: true
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

    // Calculate current streak dynamically based on studyActivity
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setUTCDate(sixtyDaysAgo.getUTCDate() - 60);

    const studyActivities = await prisma.studyActivity.findMany({
      where: {
        userId,
        activityDate: {
          gte: sixtyDaysAgo,
          lte: today
        }
      },
      select: {
        activityDate: true,
        studyTimeSeconds: true,
        questionsAnswered: true,
        examsCompleted: true
      }
    });

    const activityMap = new Map<string, typeof studyActivities[0]>();
    for (const activity of studyActivities) {
      const key = activity.activityDate.toISOString().slice(0, 10);
      activityMap.set(key, activity);
    }

    const hasCompletedActivity = (activity?: typeof studyActivities[0]): boolean => {
      if (!activity) return false;
      return (
        activity.studyTimeSeconds >= 60 ||
        activity.questionsAnswered > 0 ||
        activity.examsCompleted > 0
      );
    };

    let calculatedStreak = 0;
    let cursor = new Date(today);
    if (!hasCompletedActivity(activityMap.get(cursor.toISOString().slice(0, 10)))) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    for (let index = 0; index < 60; index += 1) {
      const key = cursor.toISOString().slice(0, 10);
      const activity = activityMap.get(key);

      if (!hasCompletedActivity(activity)) {
        break;
      }

      calculatedStreak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    const currentLongest = user?.profile?.longestStreakDays ?? 0;
    const calculatedLongest = Math.max(calculatedStreak, currentLongest);

    if (
      user?.profile &&
      (user.profile.currentStreakDays !== calculatedStreak ||
        user.profile.longestStreakDays !== calculatedLongest)
    ) {
      await prisma.userProfile.update({
        where: { userId },
        data: {
          currentStreakDays: calculatedStreak,
          longestStreakDays: calculatedLongest
        }
      });
    }

    const userProgress = await prisma.userProgress.findUnique({
      where: { userId },
      select: { totalStudyTimeSeconds: true }
    });

    const perfectExamsCount = await prisma.examSession.count({
      where: {
        userId,
        status: ExamSessionStatus.COMPLETED,
        answers: {
          some: {},
          none: {
            isCorrect: false
          }
        }
      }
    });

    const userAnswers = await prisma.examSessionAnswer.findMany({
      where: {
        examSession: {
          userId
        }
      },
      select: {
        createdAt: true,
        score: true,
        question: {
          select: {
            subject: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const hasPerfectAnswer = userAnswers.some((answer) => answer.score !== null && answer.score >= 10);
    const hasGreatAnswer = userAnswers.some((answer) => answer.score !== null && answer.score >= 7.5);
    const hasMathPerfectAnswer = userAnswers.some(
      (answer) =>
        answer.score !== null &&
        answer.score >= 10 &&
        answer.question.subject.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes("matematica")
    );
    const hasNightOwl = userAnswers.some((answer) => {
      const hr = new Date(answer.createdAt).getUTCHours();
      return hr >= 0 && hr < 4;
    });
    const hasSundayStudy = userAnswers.some((answer) => new Date(answer.createdAt).getUTCDay() === 0);

    return {
      profileCompletion,
      completedExamSessions,
      createdSharedExams,
      currentStreakDays: calculatedStreak,
      examAnswers,
      communityPosts,
      acceptedFriendships: sentAcceptedFriendships + receivedAcceptedFriendships,
      totalStudyTimeSeconds: userProgress?.totalStudyTimeSeconds ?? 0,
      perfectExamsCount,
      hasPerfectAnswer,
      hasGreatAnswer,
      hasMathPerfectAnswer,
      hasNightOwl,
      hasSundayStudy
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
        const updatedProgress = await transaction.userProgress.upsert({
          where: { userId },
          update: {
            experience: {
              increment: totalExperienceReward
            }
          },
          create: {
            userId,
            experience: totalExperienceReward
          },
          select: {
            experience: true
          }
        });

        const newExperience = updatedProgress.experience;
        let newLevel = 1;
        while (50 * newLevel * (newLevel + 1) <= newExperience) {
          newLevel++;
        }

        await transaction.userProgress.update({
          where: { userId },
          data: {
            level: newLevel
          }
        });

        await transaction.userProfile.update({
          where: { userId },
          data: {
            experience: {
              increment: totalExperienceReward
            },
            level: newLevel
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
