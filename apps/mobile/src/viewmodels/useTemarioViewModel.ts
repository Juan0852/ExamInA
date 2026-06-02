import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api.service";

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
}

export function useTemarioViewModel() {
  const subjectsQuery = useQuery<{ data: Subject[] }, Error>({
    queryKey: ["subjects"],
    queryFn: () => apiService.get<{ data: Subject[] }>("/subjects"),
  });

  return {
    subjects: subjectsQuery.data?.data || [],
    isLoadingSubjects: subjectsQuery.isLoading,
    isError: subjectsQuery.isError,
    refetchSubjects: subjectsQuery.refetch,
  };
}

export function useSubjectTopics(subjectId: string, isExpanded: boolean) {
  const topicsQuery = useQuery<{ data: Topic[] }, Error>({
    queryKey: ["topics", subjectId],
    queryFn: () => apiService.get<{ data: Topic[] }>(`/subjects/${subjectId}/topics`),
    enabled: isExpanded, // Solo carga cuando el acordeón se expande
  });

  return {
    topics: topicsQuery.data?.data || [],
    isLoadingTopics: topicsQuery.isLoading,
    isError: topicsQuery.isError,
  };
}
