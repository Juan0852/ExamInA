import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import type {
  DashboardExamSessionRecord,
  DashboardProgressRecord,
  DashboardRepository,
  DashboardStudyActivityRecord
} from "./dashboard.repository";

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async findProgressByUserId(userId: string): Promise<DashboardProgressRecord> {
    return this.prismaService.getClient().userProgress.findUnique({
      where: { userId },
      select: {
        level: true,
        experience: true,
        totalStudyTimeSeconds: true,
        totalExamsCompleted: true,
        averageScore: true
      }
    });
  }

  async findStudyActivitiesByRange(
    userId: string,
    from: Date,
    to: Date
  ): Promise<DashboardStudyActivityRecord[]> {
    return this.prismaService.getClient().studyActivity.findMany({
      where: {
        userId,
        activityDate: {
          gte: from,
          lte: to
        }
      },
      orderBy: { activityDate: "asc" },
      select: {
        activityDate: true,
        questionsAnswered: true,
        examsCompleted: true,
        studyTimeSeconds: true
      }
    });
  }

  async findRecentExamSessions(
    userId: string,
    limit: number
  ): Promise<DashboardExamSessionRecord[]> {
    return this.prismaService.getClient().examSession.findMany({
      where: { userId },
      take: limit,
      orderBy: [{ lastActivityAt: "desc" }, { updatedAt: "desc" }],
      include: {
        questions: {
          take: 1,
          select: {
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
        },
        _count: {
          select: {
            questions: true,
            answers: true
          }
        }
      }
    });
  }
}
