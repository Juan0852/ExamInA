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

interface EvaluateWrittenAnswerApiResponse {
  data: {
    attempt: {
      id: string;
      questionId: string;
      examSessionId: string | null;
      userAnswer: string;
      score: number | null;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
    correction: CorrectionFeedback;
  };
  meta: any;
  error: any;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
   * Crea un Attempt y una Correction persistida desde el backend.
   */
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validamos la respuesta del usuario con el esquema Zod local
    const validationResult = answerSchema.safeParse({ userAnswer, attachmentIds });
    if (!validationResult.success) {
      setSubmitError(validationResult.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setCorrection(null);

    try {
      if (!questionId) {
        throw new Error("ID de pregunta inválido.");
      }

      const timeSpentSeconds = Math.floor((Date.now() - questionStartTime) / 1000);

      const response = await apiService.post<EvaluateWrittenAnswerApiResponse>(
        "/corrections/evaluate-written-answer",
        {
          questionId,
          userAnswer: userAnswer.trim(),
          timeSpentSeconds,
          attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined
        }
      );

      setCorrection({
        ...response.data.correction,
        detectedErrors: response.data.correction.detectedErrors ?? [],
        missingKeywords: response.data.correction.missingKeywords ?? [],
        suggestions: response.data.correction.suggestions ?? [],
        recommendedTopics: response.data.correction.recommendedTopics ?? []
      });
      setQuestionStartTime(Date.now());
    } catch (err: any) {
      setSubmitError(err.message || "No se pudo procesar la corrección. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
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
