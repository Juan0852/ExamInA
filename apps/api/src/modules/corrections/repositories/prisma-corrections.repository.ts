import { Inject, Injectable } from "@nestjs/common";
import { AttemptStatus } from "@prisma/client";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { CorrectionResult } from "../../../shared/providers/ai/correction-provider.interface";
import type {
  AttemptWithCorrectionRecord,
  CorrectionQuestionRecord,
  CorrectionsRepository
} from "./corrections.repository";

@Injectable()
export class PrismaCorrectionsRepository implements CorrectionsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async findQuestionForCorrection(questionId: string): Promise<CorrectionQuestionRecord | null> {
    return this.prismaService.getClient().question.findUnique({
      where: { id: questionId },
      include: {
        solution: true,
        keywords: true
      }
    });
  }

  async createAttemptWithCorrection(input: {
    userId: string;
    questionId: string;
    examSessionId?: string;
    userAnswer: string;
    correction: CorrectionResult;
    timeSpentSeconds?: number;
    subjectId?: string;
    topicId?: string;
  }): Promise<AttemptWithCorrectionRecord> {
    const now = new Date();
    const attempt = await this.prismaService.getClient().attempt.create({
      data: {
        userId: input.userId,
        questionId: input.questionId,
        examSessionId: input.examSessionId,
        userAnswer: input.userAnswer,
        score: input.correction.score,
        status: AttemptStatus.CORRECTED,
        correction: {
          create: {
            isCorrect: input.correction.isCorrect,
            score: input.correction.score,
            summary: input.correction.summary,
            feedback: input.correction.feedback,
            detectedErrors: input.correction.detectedErrors,
            missingKeywords: input.correction.missingKeywords,
            suggestions: input.correction.suggestions,
            recommendedTopics: input.correction.recommendedTopics
          }
        }
      },
      include: {
        correction: true
      }
    });

    if (!attempt.correction) {
      throw new Error("Correction was not created for attempt.");
    }

    if (input.examSessionId) {
      await this.prismaService.getClient().examSessionAnswer.upsert({
        where: {
          examSessionId_questionId: {
            examSessionId: input.examSessionId,
            questionId: input.questionId
          }
        },
        create: {
          examSessionId: input.examSessionId,
          questionId: input.questionId,
          attemptId: attempt.id,
          userAnswer: input.userAnswer,
          score: input.correction.score,
          isCorrect: input.correction.isCorrect,
          answeredAt: now
        },
        update: {
          attemptId: attempt.id,
          userAnswer: input.userAnswer,
          score: input.correction.score,
          isCorrect: input.correction.isCorrect,
          answeredAt: now
        }
      });

      await this.prismaService.getClient().examSession.update({
        where: { id: input.examSessionId },
        data: {
          lastActivityAt: now,
          totalTimeSeconds: {
            increment: input.timeSpentSeconds ?? 0
          }
        }
      });
    }

    const timeDelta = input.timeSpentSeconds ?? 0;
    const isCorrect = input.correction.isCorrect;
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const prisma = this.prismaService.getClient();

    const studyActivityPromise = prisma.studyActivity.upsert({
      where: {
        userId_activityDate: {
          userId: input.userId,
          activityDate: today
        }
      },
      create: {
        userId: input.userId,
        activityDate: today,
        questionsAnswered: 1,
        correctAnswers: isCorrect ? 1 : 0,
        studyTimeSeconds: timeDelta
      },
      update: {
        questionsAnswered: { increment: 1 },
        ...(isCorrect && { correctAnswers: { increment: 1 } }),
        studyTimeSeconds: { increment: timeDelta }
      }
    });

    const userProgressPromise = prisma.userProgress.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        totalQuestionsAnswered: 1,
        totalCorrectAnswers: isCorrect ? 1 : 0,
        totalStudyTimeSeconds: timeDelta
      },
      update: {
        totalQuestionsAnswered: { increment: 1 },
        ...(isCorrect && { totalCorrectAnswers: { increment: 1 } }),
        totalStudyTimeSeconds: { increment: timeDelta }
      }
    });

    const promises: Promise<unknown>[] = [studyActivityPromise, userProgressPromise];

    if (input.subjectId) {
      promises.push(
        prisma.userSubjectProgress.upsert({
          where: {
            userId_subjectId: {
              userId: input.userId,
              subjectId: input.subjectId
            }
          },
          create: {
            userId: input.userId,
            subjectId: input.subjectId,
            questionsAnswered: 1,
            correctAnswers: isCorrect ? 1 : 0,
            studyTimeSeconds: timeDelta
          },
          update: {
            questionsAnswered: { increment: 1 },
            ...(isCorrect && { correctAnswers: { increment: 1 } }),
            studyTimeSeconds: { increment: timeDelta }
          }
        })
      );
    }

    if (input.topicId) {
      promises.push(
        prisma.userTopicProgress.upsert({
          where: {
            userId_topicId: {
              userId: input.userId,
              topicId: input.topicId
            }
          },
          create: {
            userId: input.userId,
            topicId: input.topicId,
            questionsAnswered: 1,
            correctAnswers: isCorrect ? 1 : 0,
            studyTimeSeconds: timeDelta,
            lastPracticedAt: now
          },
          update: {
            questionsAnswered: { increment: 1 },
            ...(isCorrect && { correctAnswers: { increment: 1 } }),
            studyTimeSeconds: { increment: timeDelta },
            lastPracticedAt: now
          }
        })
      );
    }

    await Promise.all(promises);

    return attempt as AttemptWithCorrectionRecord;
  }

  async resetAttempts(userId: string, questionIds: string[]): Promise<void> {
    await this.prismaService.getClient().attempt.deleteMany({
      where: {
        userId,
        questionId: {
          in: questionIds
        }
      }
    });
  }
}
