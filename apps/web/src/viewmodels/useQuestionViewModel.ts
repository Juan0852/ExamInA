import { useState } from "react";
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
 * Simulación local del resultado de corrección para el Paso 6.
 * Esto permite testear la UI de respuesta antes de construir el backend del Paso 7.
 */
export interface SimulatedCorrection {
  score: number;
  isCorrect: boolean;
  summary: string;
  feedback: string;
  detectedErrors: string[];
  missingKeywords: string[];
  suggestions: string[];
}

import { answerSchema } from "../shared/validation/schemas";

/**
 * Hook de ViewModel para la pantalla de detalle y respuesta de pregunta (QuestionPage).
 * Controla la carga de la pregunta, almacena la respuesta redactada del estudiante
 * y simula el flujo de corrección interactiva.
 */
export function useQuestionViewModel(questionId: string | undefined) {
  const [userAnswer, setUserAnswer] = useState("");
  const [correction, setCorrection] = useState<SimulatedCorrection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Obtener detalles de la pregunta mediante react-query
  const { data, isLoading, error, refetch } = useQuery<QuestionApiResponse, Error>({
    queryKey: ["question", questionId],
    queryFn: () => {
      if (!questionId) throw new Error("ID de pregunta inválido.");
      return apiService.get<QuestionApiResponse>(`/questions/${questionId}`);
    },
    enabled: !!questionId,
  });

  /**
   * Procesa el envío de la respuesta escrita.
   * Simula la llamada de corrección agregando un retraso y respondiendo un mock realista de IA.
   */
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validamos la respuesta del usuario con el esquema Zod local
    const validationResult = answerSchema.safeParse({ userAnswer });
    if (!validationResult.success) {
      setSubmitError(validationResult.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setCorrection(null);

    try {
      // Simulamos la latencia de procesamiento de la red y la IA
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulamos una corrección basada en la longitud de la respuesta
      const isMath = data?.data?.statement.toLowerCase().includes("calcula") || false;
      const score = Math.min(Math.floor(userAnswer.trim().length / 10) + 3, 10);
      const isCorrect = score >= 5;

      setCorrection({
        score,
        isCorrect,
        summary: isCorrect 
          ? "Respuesta aprobada con corrección menor." 
          : "La respuesta presenta errores conceptuales importantes.",
        feedback: isMath
          ? `Has obtenido un ${score}/10. Tu procedimiento de cálculo parece ir en la dirección correcta, pero asegúrate de comprobar los signos en la sustitución y simplificar la fracción final.`
          : `Has obtenido un ${score}/10. Mencionas parte del concepto, pero necesitas profundizar en el vocabulario académico y estructurar mejor tu desarrollo teórico.`,
        detectedErrors: isCorrect 
          ? ["Cálculo del último término redondeado con imprecisión."] 
          : ["Error de signos en la ecuación principal.", "Falta justificar el paso intermedio."],
        missingKeywords: isMath 
          ? ["Límite lateral", "Indeterminación"] 
          : ["Genotipo", "Cariotipo", "Cromosoma homólogo"],
        suggestions: [
          "Revisa de nuevo la teoría asociada a este tema.",
          "Realiza un ejercicio más simple para afianzar el procedimiento.",
          "Presta especial atención a la formulación y la nomenclatura."
        ],
      });
    } catch (err: any) {
      setSubmitError("No se pudo procesar la corrección. Inténtalo de nuevo.");
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
  };

  return {
    question: data?.data || null,
    isLoading: isLoading || !questionId,
    error: error ? error.message : null,
    userAnswer,
    setUserAnswer,
    correction,
    isSubmitting,
    submitError,
    handleSubmitAnswer,
    handleReset,
    handleRetry: refetch,
  };
}
