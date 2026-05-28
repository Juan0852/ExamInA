import { Inject, Injectable } from "@nestjs/common";
import { ExamSessionMode, ExamSessionStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { ExamSessionRecord, ExamSessionsRepository } from "./exam-sessions.repository";

@Injectable()
export class PrismaExamSessionsRepository implements ExamSessionsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  private readonly maxActivityDeltaSeconds = 6 * 60 * 60;

  async findByIdForUser(examSessionId: string, userId: string): Promise<ExamSessionRecord | null> {
    return this.prismaService.getClient().examSession.findFirst({
      where: {
        id: examSessionId,
        userId
      },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            question: {
              select: {
                statement: true,
                type: true,
                difficulty: true,
                sourceYear: true,
                sourceExam: true
              }
            }
          }
        },
        answers: {
          select: {
            questionId: true,
            userAnswer: true,
            score: true,
            isCorrect: true,
            attemptId: true,
            attempt: {
              select: {
                correction: {
                  select: {
                    feedback: true,
                    detectedErrors: true,
                    missingKeywords: true,
                    suggestions: true
                  }
                }
              }
            }
          }
        }
      }
    }) as Promise<ExamSessionRecord | null>;
  }

  async findAllForUser(userId: string): Promise<ExamSessionRecord[]> {
    return this.prismaService.getClient().examSession.findMany({
      where: { userId },
      orderBy: { lastActivityAt: "desc" },
      take: 20,
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            question: {
              select: {
                statement: true,
                type: true,
                difficulty: true,
                sourceYear: true,
                sourceExam: true
              }
            }
          }
        },
        answers: {
          select: {
            questionId: true,
            userAnswer: true,
            score: true,
            isCorrect: true,
            attemptId: true,
            attempt: {
              select: {
                correction: {
                  select: {
                    feedback: true,
                    detectedErrors: true,
                    missingKeywords: true,
                    suggestions: true
                  }
                }
              }
            }
          }
        }
      }
    }) as unknown as Promise<ExamSessionRecord[]>;
  }

  async findAllCompletedForUser(userId: string): Promise<ExamSessionRecord[]> {
    return this.prismaService.getClient().examSession.findMany({
      where: {
        userId,
        status: ExamSessionStatus.COMPLETED
      },
      orderBy: { finishedAt: "desc" },
      take: 20,
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            question: {
              select: {
                statement: true,
                type: true,
                difficulty: true,
                sourceYear: true,
                sourceExam: true
              }
            }
          }
        },
        answers: {
          select: {
            questionId: true,
            userAnswer: true,
            score: true,
            isCorrect: true,
            attemptId: true,
            attempt: {
              select: {
                correction: {
                  select: {
                    feedback: true,
                    detectedErrors: true,
                    missingKeywords: true,
                    suggestions: true
                  }
                }
              }
            }
          }
        }
      }
    }) as unknown as Promise<ExamSessionRecord[]>;
  }

  async finish(examSessionId: string, userId: string, totalTimeSeconds: number): Promise<ExamSessionRecord> {
    return this.prismaService.getClient().examSession.update({
      where: { id: examSessionId, userId },
      data: {
        status: ExamSessionStatus.COMPLETED,
        finishedAt: new Date(),
        totalTimeSeconds
      },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            question: {
              select: {
                statement: true,
                type: true,
                difficulty: true,
                sourceYear: true,
                sourceExam: true
              }
            }
          }
        },
        answers: {
          select: {
            questionId: true,
            userAnswer: true,
            score: true,
            isCorrect: true,
            attemptId: true,
            attempt: {
              select: {
                correction: {
                  select: {
                    feedback: true,
                    detectedErrors: true,
                    missingKeywords: true,
                    suggestions: true
                  }
                }
              }
            }
          }
        }
      }
    }) as unknown as ExamSessionRecord;
  }

  async syncActivity(input: {
    examSessionId: string;
    userId: string;
    elapsedSeconds: number;
  }): Promise<{ totalTimeSeconds: number; recordedDeltaSeconds: number }> {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    return this.prismaService.getClient().$transaction(async (tx) => {
      const session = await tx.examSession.findFirst({
        where: {
          id: input.examSessionId,
          userId: input.userId
        },
        select: {
          id: true,
          status: true,
          totalTimeSeconds: true
        }
      });

      if (!session || session.status === ExamSessionStatus.COMPLETED || session.status === ExamSessionStatus.ABANDONED) {
        return {
          totalTimeSeconds: session?.totalTimeSeconds ?? 0,
          recordedDeltaSeconds: 0
        };
      }

      const rawDelta = input.elapsedSeconds - session.totalTimeSeconds;
      const recordedDeltaSeconds = Math.max(
        0,
        Math.min(rawDelta, this.maxActivityDeltaSeconds)
      );

      if (recordedDeltaSeconds === 0) {
        await tx.examSession.update({
          where: { id: session.id },
          data: {
            lastActivityAt: now
          }
        });

        return {
          totalTimeSeconds: session.totalTimeSeconds,
          recordedDeltaSeconds
        };
      }

      const updatedSession = await tx.examSession.update({
        where: { id: session.id },
        data: {
          totalTimeSeconds: {
            increment: recordedDeltaSeconds
          },
          lastActivityAt: now
        },
        select: {
          totalTimeSeconds: true
        }
      });

      await tx.studyActivity.upsert({
        where: {
          userId_activityDate: {
            userId: input.userId,
            activityDate: today
          }
        },
        create: {
          userId: input.userId,
          activityDate: today,
          studyTimeSeconds: recordedDeltaSeconds
        },
        update: {
          studyTimeSeconds: {
            increment: recordedDeltaSeconds
          }
        }
      });

      await tx.userProgress.upsert({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          totalStudyTimeSeconds: recordedDeltaSeconds
        },
        update: {
          totalStudyTimeSeconds: {
            increment: recordedDeltaSeconds
          }
        }
      });

      return {
        totalTimeSeconds: updatedSession.totalTimeSeconds,
        recordedDeltaSeconds
      };
    });
  }

  async deleteForUser(examSessionId: string, userId: string): Promise<boolean> {
    const result = await this.prismaService.getClient().examSession.deleteMany({
      where: {
        id: examSessionId,
        userId
      }
    });

    return result.count > 0;
  }

  async create(input: {
    userId: string;
    title: string;
    questionIds: string[];
    timerEnabled?: boolean;
    durationLimitSeconds?: number;
  }): Promise<ExamSessionRecord> {
    const questions = await this.prismaService.getClient().question.findMany({
      where: { id: { in: input.questionIds } },
      include: { solution: true }
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const orderedQuestions = input.questionIds
      .map((id) => questionMap.get(id))
      .filter((q): q is NonNullable<typeof q> => q != null);

    return this.prismaService.getClient().examSession.create({
      data: {
        userId: input.userId,
        title: input.title,
        mode: ExamSessionMode.PRACTICE,
        status: ExamSessionStatus.IN_PROGRESS,
        timerEnabled: input.timerEnabled ?? false,
        durationLimitSeconds: input.durationLimitSeconds ?? null,
        startedAt: new Date(),
        lastActivityAt: new Date(),
        questions: {
          create: orderedQuestions.map((question, index) => ({
            question: { connect: { id: question.id } },
            sortOrder: index,
            questionSnapshot: {
              statement: question.statement,
              type: question.type,
              difficulty: question.difficulty,
              sourceYear: question.sourceYear,
              sourceExam: question.sourceExam
            },
            solutionSnapshot: question.solution
              ? {
                  finalAnswer: question.solution.finalAnswer,
                  explanation: question.solution.explanation
                }
              : Prisma.DbNull
          }))
        }
      },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            question: {
              select: {
                statement: true,
                type: true,
                difficulty: true,
                sourceYear: true,
                sourceExam: true
              }
            }
          }
        },
        answers: {
          select: {
            questionId: true,
            userAnswer: true,
            score: true,
            isCorrect: true,
            attemptId: true,
            attempt: {
              select: {
                correction: {
                  select: {
                    feedback: true,
                    detectedErrors: true,
                    missingKeywords: true,
                    suggestions: true
                  }
                }
              }
            }
          }
        }
      }
    }) as unknown as ExamSessionRecord;
  }
}
