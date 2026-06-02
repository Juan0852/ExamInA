import { useQuery } from "@tanstack/react-query";
import { apiService } from "../shared/services/api.service";

export interface ExamSessionQuestion {
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
    detectedErrors: string[];
    missingKeywords: string[];
    suggestions: string[];
  } | null;
}

export interface ExamSession {
  id: string;
  title: string;
  mode: string;
  status: string;
  durationLimitSeconds: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  lastActivityAt: string | null;
  totalTimeSeconds: number;
  questions: ExamSessionQuestion[];
}

interface ExamSessionApiResponse {
  data: ExamSession;
  meta: any;
  error: any;
}

export function useExamSessionViewModel(examSessionId: string | undefined) {
  const query = useQuery<ExamSessionApiResponse, Error>({
    queryKey: ["exam-session", examSessionId],
    queryFn: () => {
      if (!examSessionId) {
        throw new Error("ID de examen inválido.");
      }

      return apiService.get<ExamSessionApiResponse>(`/exam-sessions/${examSessionId}`);
    },
    enabled: Boolean(examSessionId)
  });

  return {
    examSession: query.data?.data ?? null,
    isLoading: query.isLoading || !examSessionId,
    error: query.error?.message ?? null,
    handleRetry: query.refetch
  };
}
