export type CorrectionResponseDto = {
  id: string;
  attemptId: string;
  isCorrect: boolean;
  score: number;
  summary: string;
  feedback: string;
  detectedErrors: string[];
  missingKeywords: string[];
  suggestions: string[];
  recommendedTopics: string[];
  createdAt: string;
};

export type EvaluateWrittenAnswerResponseDto = {
  data: {
    attempt: {
      id: string;
      questionId: string;
      examSessionId: string | null;
      userAnswer: string;
      score: number | null;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
    correction: CorrectionResponseDto;
  };
  meta: {};
  error: null;
};
