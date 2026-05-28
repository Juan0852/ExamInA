import type { Attempt, Correction, Question, QuestionKeyword, QuestionSolution } from "@prisma/client";
import type { CorrectionResult } from "../../../shared/providers/ai/correction-provider.interface";

export type CorrectionQuestionRecord = Question & {
  solution: QuestionSolution | null;
  keywords: QuestionKeyword[];
};

export type AttemptWithCorrectionRecord = Attempt & {
  correction: Correction;
};

export interface CorrectionsRepository {
  findQuestionForCorrection(questionId: string): Promise<CorrectionQuestionRecord | null>;
  createAttemptWithCorrection(input: {
    userId: string;
    questionId: string;
    examSessionId?: string;
    userAnswer: string;
    correction: CorrectionResult;
    timeSpentSeconds?: number;
    subjectId?: string;
    topicId?: string;
  }): Promise<AttemptWithCorrectionRecord>;
  resetAttempts(userId: string, questionIds: string[]): Promise<void>;
}
