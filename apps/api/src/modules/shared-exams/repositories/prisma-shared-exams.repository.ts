import { Inject, Injectable } from "@nestjs/common";
import { CommunityVisibility, ExamSessionMode, ExamSessionStatus, SharedExamStatus, SharedExamUsageStatus } from "@prisma/client";
import { PrismaService } from "../../../shared/database/prisma.service";
import type {
  SharedExamStartRecord,
  SharedExamSummaryRecord,
  SharedExamsRepository
} from "./shared-exams.repository";

@Injectable()
export class PrismaSharedExamsRepository implements SharedExamsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async findPublished(input?: { subjectId?: string }): Promise<SharedExamSummaryRecord[]> {
    return this.prismaService.getClient().sharedExam.findMany({
      where: {
        visibility: CommunityVisibility.PUBLIC,
        status: SharedExamStatus.PUBLISHED,
        ...(input?.subjectId
          ? {
              questions: {
                some: {
                  question: {
                    subjectId: input.subjectId
                  }
                }
              }
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            profile: {
              select: {
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });
  }

  async findPublishedById(sharedExamId: string): Promise<SharedExamStartRecord | null> {
    return this.prismaService.getClient().sharedExam.findFirst({
      where: {
        id: sharedExamId,
        visibility: CommunityVisibility.PUBLIC,
        status: SharedExamStatus.PUBLISHED
      },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          select: {
            questionId: true,
            sortOrder: true,
            questionSnapshot: true,
            solutionSnapshot: true
          }
        }
      }
    });
  }

  async startForUser(input: {
    sharedExam: SharedExamStartRecord;
    userId: string;
  }): Promise<{ examSessionId: string }> {
    const examSession = await this.prismaService.getClient().examSession.create({
      data: {
        userId: input.userId,
        title: input.sharedExam.title,
        mode: ExamSessionMode.MOCK_EXAM,
        status: ExamSessionStatus.IN_PROGRESS,
        timerEnabled: true,
        durationLimitSeconds: 5400,
        startedAt: new Date(),
        lastActivityAt: new Date(),
        questions: {
          create: input.sharedExam.questions.map((question) => ({
            question: {
              connect: {
                id: question.questionId
              }
            },
            sortOrder: question.sortOrder,
            questionSnapshot: question.questionSnapshot as any,
            solutionSnapshot: question.solutionSnapshot as any
          }))
        },
        sharedExamUsages: {
          create: {
            sharedExamId: input.sharedExam.id,
            userId: input.userId,
            status: SharedExamUsageStatus.STARTED,
            startedAt: new Date()
          }
        }
      },
      select: {
        id: true
      }
    });

    return {
      examSessionId: examSession.id
    };
  }

  async findMine(userId: string): Promise<SharedExamSummaryRecord[]> {
    return this.prismaService.getClient().sharedExam.findMany({
      where: {
        ownerId: userId
      },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            profile: {
              select: {
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });
  }

  async updateVisibility(
    sharedExamId: string,
    userId: string,
    visibility: CommunityVisibility,
    status: SharedExamStatus
  ): Promise<SharedExamSummaryRecord> {
    return this.prismaService.getClient().sharedExam.update({
      where: {
        id: sharedExamId,
        ownerId: userId
      },
      data: {
        visibility,
        status
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            profile: {
              select: {
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });
  }
}

