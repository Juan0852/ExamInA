import { useQuery } from "@tanstack/react-query";
import { apiService } from "../shared/services/api.service";

/**
 * Representa una asignatura académica recibida del backend.
 */
export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

/**
 * Respuesta envuelta estándar de la API de asignaturas.
 */
interface SubjectsApiResponse {
  data: Subject[];
  meta: {
    total: number;
  };
  error: any;
}

/**
 * Hook de ViewModel para la pantalla de catálogo de asignaturas (SubjectsPage).
 * Consume el endpoint del catálogo académico y gestiona estados de carga y error mediante react-query.
 */
export function useSubjectsViewModel() {
  const { data, isLoading, error, refetch } = useQuery<SubjectsApiResponse, Error>({
    queryKey: ["subjects"],
    queryFn: () => apiService.get<SubjectsApiResponse>("/subjects"),
  });

  return {
    subjects: data?.data || [],
    totalCount: data?.meta?.total || 0,
    isLoading,
    error: error?.message || null,
    handleRetry: refetch,
  };
}
