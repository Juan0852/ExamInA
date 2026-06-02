import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { CorrectionResult } from "../../../shared/providers/ai/correction-provider.interface";
import type {
  CorrectionQuestionRecord,
  CorrectionsRepository,
  ExamSessionAnswerWithCorrectionRecord
} from "./corrections.repository";

@Injectable()
export class PrismaCorrectionsRepository implements CorrectionsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async findQuestionForCorrection(questionId: string): Promise<CorrectionQuestionRecord | null> {
    return this.prismaService.getClient().question.findUnique({
      where: { id: questionId },
      include: {
        solution: true
      }
    });
  }

  async findSessionQuestionForUser(input: {
    userId: string;
    examSessionId: string;
    questionId: string;
  }): Promise<{ id: string } | null> {
    return this.prismaService.getClient().examSessionQuestion.findFirst({
      where: {
        examSessionId: input.examSessionId,
        questionId: input.questionId,
        examSession: {
          userId: input.userId
        }
      },
      select: {
        id: true
      }
    });
  }

  async findAnswerForSessionQuestion(input: {
    examSessionId: string;
    questionId: string;
  }): Promise<{ id: string } | null> {
    return this.prismaService.getClient().examSessionAnswer.findUnique({
      where: {
        examSessionId_questionId: {
          examSessionId: input.examSessionId,
          questionId: input.questionId
        }
      },
      select: {
        id: true
      }
    });
  }

  async createAnswerWithCorrection(input: {
    userId: string;
    questionId: string;
    examSessionId: string;
    userAnswer: string;
    correction: CorrectionResult;
    timeSpentSeconds?: number;
    subjectId?: string;
  }): Promise<ExamSessionAnswerWithCorrectionRecord> {
    const now = new Date();
    const prisma = this.prismaService.getClient();
    const timeDelta = input.timeSpentSeconds ?? 0;
    const isCorrect = input.correction.isCorrect;
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const answer = await prisma.examSessionAnswer.create({
      data: {
        examSessionId: input.examSessionId,
        questionId: input.questionId,
        userAnswer: input.userAnswer,
        score: input.correction.score,
        isCorrect,
        answeredAt: now,
        correction: {
          create: {
            isCorrect,
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

    if (!answer.correction) {
      throw new Error("Correction was not created for exam session answer.");
    }

    const answerWithCorrection: ExamSessionAnswerWithCorrectionRecord = {
      ...answer,
      correction: answer.correction
    };

    await prisma.examSession.update({
      where: { id: input.examSessionId },
      data: {
        lastActivityAt: now,
        totalTimeSeconds: {
          increment: timeDelta
        }
      }
    });

    await prisma.studyActivity.upsert({
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

    await prisma.userProgress.upsert({
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

    if (input.subjectId) {
      await prisma.userSubjectProgress.upsert({
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
      });
    }

    return answerWithCorrection;
  }
}
