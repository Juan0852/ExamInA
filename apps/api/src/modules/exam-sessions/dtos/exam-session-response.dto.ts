export type ExamSessionResponseDto = {
  id: string;
  title: string;
  mode: string;
  status: string;
  timerEnabled: boolean;
  durationLimitSeconds: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  lastActivityAt: string | null;
  totalTimeSeconds: number;
  questions: {
    id: string;
    questionId: string;
    order: number;
    statement: string;
    type: string;
    difficulty: string;
    sourceYear: number | null;
    sourceExam: string | null;
    answered: boolean;
    userAnswer: string | null;
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

export type ExamSessionEnvelopeDto = {
  data: ExamSessionResponseDto;
  meta: {};
  error: null;
};
