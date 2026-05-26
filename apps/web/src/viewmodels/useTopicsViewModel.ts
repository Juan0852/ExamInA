import { useQuery } from "@tanstack/react-query";
import { apiService } from "../shared/services/api.service";

/**
 * Representa un tema académico perteneciente a una asignatura.
 */
export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
}

/**
 * Respuesta envuelta estándar de la API de temas.
 */
interface TopicsApiResponse {
  data: Topic[];
  meta: {
    total: number;
  };
  error: any;
}

/**
 * Hook de ViewModel para la pantalla de temas de una asignatura (TopicsPage).
 * Encapsula la obtención de datos basada en el identificador de asignatura y controla la vista.
 */
export function useTopicsViewModel(subjectId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery<TopicsApiResponse, Error>({
    queryKey: ["topics", subjectId],
    queryFn: () => {
      if (!subjectId) throw new Error("ID de asignatura inválido.");
      return apiService.get<TopicsApiResponse>(`/subjects/${subjectId}/topics`);
    },
    enabled: !!subjectId, // Solo se ejecuta si subjectId tiene valor
  });

  return {
    topics: data?.data || [],
    totalCount: data?.meta?.total || 0,
    isLoading: isLoading || !subjectId,
    error: error ? error.message : null,
    handleRetry: refetch,
  };
}
