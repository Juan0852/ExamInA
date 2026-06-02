import type { Correction, ExamSessionAnswer, Question, QuestionSolution } from "@prisma/client";
import type { CorrectionResult } from "../../../shared/providers/ai/correction-provider.interface";

export type CorrectionQuestionRecord = Question & {
  solution: QuestionSolution | null;
};

export type ExamSessionAnswerWithCorrectionRecord = ExamSessionAnswer & {
  correction: Correction;
};

export interface CorrectionsRepository {
  findQuestionForCorrection(questionId: string): Promise<CorrectionQuestionRecord | null>;
  findSessionQuestionForUser(input: {
    userId: string;
    examSessionId: string;
    questionId: string;
  }): Promise<{ id: string } | null>;
  findAnswerForSessionQuestion(input: {
    examSessionId: string;
    questionId: string;
  }): Promise<{ id: string } | null>;
  createAnswerWithCorrection(input: {
    userId: string;
    questionId: string;
    examSessionId: string;
    userAnswer: string;
    correction: CorrectionResult;
    timeSpentSeconds?: number;
    subjectId?: string;
    topicId?: string;
  }): Promise<ExamSessionAnswerWithCorrectionRecord>;
}
