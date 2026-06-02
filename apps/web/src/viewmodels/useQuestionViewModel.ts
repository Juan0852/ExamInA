import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../shared/services/api.service";

/**
 * Representa una pregunta del catálogo académico.
 */
export interface Question {
  id: string;
  subjectId: string;
  topicId: string;
  statement: string;
  type: "OPEN_ANSWER" | "MULTIPLE_CHOICE" | "PROCEDURE" | "FLASHCARD";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceYear?: number | null;
  sourceExam?: string | null;
  isAnswered?: boolean;
}

/**
 * Respuesta envuelta estándar de la API de preguntas.
 */
interface QuestionApiResponse {
  data: Question;
  meta: any;
  error: any;
}

/**
 * Resultado de corrección devuelto por el backend.
 */
export interface CorrectionFeedback {
  score: number;
  isCorrect: boolean;
  summary: string;
  feedback: string;
  detectedErrors: string[];
  missingKeywords: string[];
  suggestions: string[];
  recommendedTopics: string[];
}

import { answerSchema } from "../shared/validation/schemas";

/**
 * Hook de ViewModel para la pantalla de detalle y respuesta de pregunta (QuestionPage).
 * Controla la carga de la pregunta, almacena la respuesta redactada del estudiante
 * y envía la respuesta al backend para corrección con el provider LLM configurado.
 */
export function useQuestionViewModel(questionId: string | undefined) {
  const [userAnswer, setUserAnswer] = useState("");
  const [correction, setCorrection] = useState<CorrectionFeedback | null>(null);
  const [isSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);

  // Obtener detalles de la pregunta mediante react-query
  const { data, isLoading, error, refetch } = useQuery<QuestionApiResponse, Error>({
    queryKey: ["question", questionId],
    queryFn: () => {
      if (!questionId) throw new Error("ID de pregunta inválido.");
      return apiService.get<QuestionApiResponse>(`/questions/${questionId}`);
    },
    enabled: !!questionId,
  });

  // Resetear el temporizador cuando la pregunta cargue
  useEffect(() => {
    if (data) {
      setQuestionStartTime(Date.now());
    }
  }, [data]);

  /**
   * Procesa el envío de la respuesta escrita.
   * La evaluacion IA solo esta disponible dentro de una sesion de examen.
   */
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validamos la respuesta del usuario con el esquema Zod local
    const validationResult = answerSchema.safeParse({ userAnswer, attachmentIds });
    if (!validationResult.success) {
      setSubmitError(validationResult.error.issues[0].message);
      return;
    }

    setSubmitError("La evaluación IA solo está disponible dentro de una sesión de examen.");
    setCorrection(null);
  };

  /**
   * Resetea el formulario para permitir volver a responder la misma pregunta.
   */
  const handleReset = () => {
    setUserAnswer("");
    setCorrection(null);
    setSubmitError(null);
    setQuestionStartTime(Date.now());
    setAttachmentIds([]);
  };

  return {
    question: data?.data || null,
    isLoading: isLoading || !questionId,
    error: error ? error.message : null,
    userAnswer,
    setUserAnswer,
    attachmentIds,
    setAttachmentIds,
    correction,
    setCorrection,
    isSubmitting,
    submitError,
    handleSubmitAnswer,
    handleReset,
    handleRetry: refetch,
  };
}
