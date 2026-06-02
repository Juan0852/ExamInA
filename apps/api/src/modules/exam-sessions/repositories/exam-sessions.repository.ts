import type { ExamSession } from "@prisma/client";

export type ExamSessionRecord = ExamSession & {
  questions: {
    id: string;
    questionId: string;
    sortOrder: number;
    questionSnapshot: unknown;
    question: {
      statement: string;
      type: string;
      difficulty: string;
      sourceYear: number | null;
      sourceExam: string | null;
    };
  }[];
  answers: {
    questionId: string;
    userAnswer: string;
    score: number | null;
    isCorrect: boolean | null;
    correction: {
      feedback: string;
      detectedErrors: unknown;
      missingKeywords: unknown;
      suggestions: unknown;
    } | null;
  }[];
};

export interface ExamSessionsRepository {
  findByIdForUser(examSessionId: string, userId: string): Promise<ExamSessionRecord | null>;
  findAllForUser(userId: string, subjectId?: string): Promise<ExamSessionRecord[]>;
  findAllCompletedForUser(userId: string): Promise<ExamSessionRecord[]>;
  create(input: {
    userId: string;
    title: string;
    questionIds: string[];
    durationLimitSeconds?: number;
  }): Promise<ExamSessionRecord>;
  syncActivity(input: {
    examSessionId: string;
    userId: string;
    elapsedSeconds: number;
  }): Promise<{ totalTimeSeconds: number; recordedDeltaSeconds: number }>;
  finish(examSessionId: string, userId: string, totalTimeSeconds: number): Promise<ExamSessionRecord>;
  deleteForUser(examSessionId: string, userId: string): Promise<boolean>;
}
