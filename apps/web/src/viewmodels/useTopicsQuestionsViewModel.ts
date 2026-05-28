import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../shared/services/api.service";
import type { Topic } from "./useTopicsViewModel";
import type { Question } from "./useQuestionViewModel";

/**
 * Respuesta envuelta estándar de la API de temas.
 */
interface TopicsApiResponse {
  data: Topic[];
  meta: any;
  error: any;
}

/**
 * Respuesta envuelta estándar de la API de preguntas.
 */
interface QuestionsApiResponse {
  data: Question[];
  meta: any;
  error: any;
}

/**
 * Hook de ViewModel para la pantalla combinada de Temas y Preguntas (TopicsPage).
 * Controla el listado de temas y permite realizar filtros interactivos sobre el banco
 * de preguntas de la asignatura seleccionada (por ejemplo, al pinchar sobre un tema).
 */
export function useTopicsQuestionsViewModel(subjectId: string | undefined, initialTopicId: string | null = null) {
  // Estado local para el tema seleccionado para filtros
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(initialTopicId);

  // 1. Fetch de los temas de la asignatura
  const topicsQuery = useQuery<TopicsApiResponse, Error>({
    queryKey: ["topics", subjectId],
    queryFn: () => {
      if (!subjectId) throw new Error("ID de asignatura inválido.");
      return apiService.get<TopicsApiResponse>(`/subjects/${subjectId}/topics`);
    },
    enabled: !!subjectId,
  });

  // 2. Fetch de las preguntas de la asignatura (filtrables por tema)
  const questionsQuery = useQuery<QuestionsApiResponse, Error>({
    queryKey: ["questions", subjectId, selectedTopicId],
    queryFn: () => {
      if (!subjectId) throw new Error("ID de asignatura inválido.");
      let path = `/questions?subjectId=${subjectId}`;
      if (selectedTopicId) {
        path += `&topicId=${selectedTopicId}`;
      }
      return apiService.get<QuestionsApiResponse>(path);
    },
    enabled: !!subjectId,
  });

  /**
   * Cambia el filtro de tema activo. Si se pincha sobre el ya seleccionado, se limpia el filtro.
   */
  const handleToggleTopicFilter = (topicId: string) => {
    if (selectedTopicId === topicId) {
      setSelectedTopicId(null); // Quitar filtro
    } else {
      setSelectedTopicId(topicId); // Aplicar filtro
    }
  };

  const handleClearFilters = () => {
    setSelectedTopicId(null);
  };

  return {
    topics: topicsQuery.data?.data || [],
    questions: questionsQuery.data?.data || [],
    selectedTopicId,
    isLoading: topicsQuery.isLoading || questionsQuery.isLoading || !subjectId,
    error: topicsQuery.error?.message || questionsQuery.error?.message || null,
    handleToggleTopicFilter,
    handleClearFilters,
    handleRetry: () => {
      topicsQuery.refetch();
      questionsQuery.refetch();
    },
  };
}
