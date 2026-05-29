import type { SharedExam, CommunityVisibility, SharedExamStatus } from "@prisma/client";

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
  findMine(userId: string): Promise<SharedExamSummaryRecord[]>;
  updateVisibility(
    sharedExamId: string,
    userId: string,
    visibility: CommunityVisibility,
    status: SharedExamStatus
  ): Promise<SharedExamSummaryRecord>;
  startForUser(input: {
    sharedExam: SharedExamStartRecord;
    userId: string;
  }): Promise<{ examSessionId: string }>;
  create(input: {
    ownerId: string;
    title: string;
    description?: string;
    visibility?: CommunityVisibility;
    allowCloning?: boolean;
    questions: {
      questionId?: string;
      customQuestion?: {
        subjectId: string;
        topicId: string;
        statement: string;
        difficulty: string;
        finalAnswer: string;
        explanation: string;
      };
    }[];
  }): Promise<SharedExamSummaryRecord>;
}
