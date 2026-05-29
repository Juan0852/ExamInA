import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api.service";

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
  solution?: {
    finalAnswer: string;
    explanation: string;
  };
}

export interface ExamSession {
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
  questions: ExamSessionQuestion[];
}

interface ExamSessionApiResponse {
  data: ExamSession;
  meta: any;
  error: any;
}

export function useExamSessionViewModel(examSessionId: string | undefined) {
  const queryClient = useQueryClient();

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

  const activityMutation = useMutation({
    mutationFn: (data: { questionId: string; score: number }) => {
      return apiService.patch(`/exam-sessions/${examSessionId}/activity`, {
        questionId: data.questionId,
        score: data.score, // Enviamos el score directamente basado en el swipe (ej. 10 para derecha, 0 para izquierda)
        timeSpentSeconds: 5, // Fijo por ahora
        userAnswer: "Self-assessed via Flashcard Mode",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-session", examSessionId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    }
  });

  const finishMutation = useMutation({
    mutationFn: () => {
      return apiService.patch(`/exam-sessions/${examSessionId}/finish`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-session", examSessionId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    }
  });

  return {
    examSession: query.data?.data ?? null,
    isLoading: query.isLoading || !examSessionId,
    error: query.error?.message ?? null,
    handleRetry: query.refetch,
    saveActivity: (questionId: string, score: number) => activityMutation.mutate({ questionId, score }),
    finishExam: () => finishMutation.mutate(),
    isSaving: activityMutation.isPending || finishMutation.isPending
  };
}
