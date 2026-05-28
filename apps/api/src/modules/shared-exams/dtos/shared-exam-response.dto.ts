export type SharedExamSummaryResponseDto = {
  id: string;
  title: string;
  description: string | null;
  visibility: string;
  status: string;
  questionCount: number;
  owner: {
    id: string;
    displayName: string | null;
    photoUrl: string | null;
    username: string | null;
  };
  createdAt: string;
};

export type SharedExamsResponseDto = {
  data: SharedExamSummaryResponseDto[];
  meta: {
    total: number;
  };
  error: null;
};

export type StartSharedExamResponseDto = {
  data: {
    examSessionId: string;
  };
  meta: {};
  error: null;
};
