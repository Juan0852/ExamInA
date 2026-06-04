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

interface SyncExamActivityApiResponse {
  data: {
    totalTimeSeconds: number;
    recordedDeltaSeconds: number;
  };
  meta: any;
  error: any;
}

interface EvaluateAnswerApiResponse {
  data: {
    correction: {
      score: number;
      feedback: string;
      detectedErrors: string[];
      missingKeywords: string[];
      suggestions: string[];
    };
  };
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
    mutationFn: (data: { elapsedSeconds: number }) => {
      return apiService.patch<SyncExamActivityApiResponse>(
        `/exam-sessions/${examSessionId}/activity`,
        {
          elapsedSeconds: data.elapsedSeconds
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-session", examSessionId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    }
  });

  const finishMutation = useMutation({
    mutationFn: (data: { totalTimeSeconds: number }) => {
      return apiService.patch(`/exam-sessions/${examSessionId}/finish`, {
        totalTimeSeconds: data.totalTimeSeconds
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-session", examSessionId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    }
  });

  const evaluateAnswerMutation = useMutation({
    mutationFn: (data: { questionId: string; userAnswer: string; attachmentIds?: string[] }) => {
      return apiService.post<EvaluateAnswerApiResponse>(`/corrections/evaluate-written-answer`, {
        questionId: data.questionId,
        userAnswer: data.userAnswer,
        examSessionId: examSessionId,
        attachmentIds: data.attachmentIds || [],
      });
    }
  });

  return {
    examSession: query.data?.data ?? null,
    isLoading: query.isLoading || !examSessionId,
    error: query.error?.message ?? null,
    handleRetry: query.refetch,
    saveActivity: (elapsedSeconds: number) => activityMutation.mutateAsync({ elapsedSeconds }),
    evaluateAnswer: (data: { questionId: string; userAnswer: string; attachmentIds?: string[] }) => evaluateAnswerMutation.mutateAsync(data),
    finishExam: (totalTimeSeconds: number) => finishMutation.mutate({ totalTimeSeconds }),
    isSaving: activityMutation.isPending || finishMutation.isPending,
    isEvaluating: evaluateAnswerMutation.isPending
  };
}

export function useSubjectExams(subjectId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: ExamSession[] }, Error>({
    queryKey: ["subject-exams", subjectId],
    queryFn: () => apiService.get<{ data: ExamSession[] }>(`/exam-sessions/me?subjectId=${subjectId}`),
    enabled: Boolean(subjectId)
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      // Create an exam by hitting a hypothetical endpoint or using the generic one
      // For now, we will create an exam by passing the subjectId to the backend
      // Wait, we need to pass questionIds. Let's fetch questions first?
      // For this demo, let's assume the backend handles this or we pass empty and it creates one
      throw new Error("Not fully implemented yet");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-exams", subjectId] });
    }
  });

  return {
    exams: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch
  };
}
