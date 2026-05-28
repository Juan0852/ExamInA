import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../shared/services/api.service";

export interface OfficialExam {
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
}

interface OfficialExamsApiResponse {
  data: OfficialExam[];
  meta: {
    total: number;
  };
  error: null;
}

interface StartOfficialExamApiResponse {
  data: {
    examSessionId: string;
  };
  meta: {};
  error: null;
}

export function useOfficialExamsViewModel(subjectId?: string) {
  const navigate = useNavigate();
  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const query = useQuery<OfficialExamsApiResponse, Error>({
    queryKey: ["official-exams", subjectId],
    queryFn: () =>
      apiService.get<OfficialExamsApiResponse>(
        subjectId ? `/shared-exams?subjectId=${encodeURIComponent(subjectId)}` : "/shared-exams"
      )
  });

  const handleStartExam = async (sharedExamId: string) => {
    setStartingExamId(sharedExamId);
    setStartError(null);

    try {
      const response = await apiService.post<StartOfficialExamApiResponse>(
        `/shared-exams/${sharedExamId}/start`
      );
      navigate(`/exam-sessions/${response.data.examSessionId}`);
    } catch (err: any) {
      setStartError(err.message || "No se pudo iniciar el examen.");
    } finally {
      setStartingExamId(null);
    }
  };

  return {
    exams: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    startError,
    startingExamId,
    handleRetry: query.refetch,
    handleStartExam
  };
}
