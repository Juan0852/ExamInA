import type { SharedExam } from "@prisma/client";

export type SharedExamSummaryRecord = SharedExam & {
  owner: {
    id: string;
    displayName: string | null;
    photoUrl: string | null;
    profile: {
      username: string;
    } | null;
  };
  _count: {
    questions: number;
  };
};

export type SharedExamQuestionRecord = {
  questionId: string;
  sortOrder: number;
  questionSnapshot: unknown;
  solutionSnapshot: unknown;
};

export type SharedExamStartRecord = SharedExam & {
  questions: SharedExamQuestionRecord[];
};

export interface SharedExamsRepository {
  findPublished(input?: { subjectId?: string }): Promise<SharedExamSummaryRecord[]>;
  findPublishedById(sharedExamId: string): Promise<SharedExamStartRecord | null>;
  startForUser(input: {
    sharedExam: SharedExamStartRecord;
    userId: string;
  }): Promise<{ examSessionId: string }>;
}
