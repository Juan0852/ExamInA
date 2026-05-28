import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  X,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Key,
  ListChecks,
  HelpCircle,
  Brain,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { useExamSessionViewModel } from "../viewmodels/useExamSessionViewModel";
import { apiService } from "../shared/services/api.service";
import type { CorrectionFeedback } from "../viewmodels/useQuestionViewModel";
import { MathText } from "../shared/components/MathText";
import { AnswerAttachmentComposer } from "../shared/components/AnswerAttachmentComposer";

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

interface SyncExamActivityApiResponse {
  data: {
    totalTimeSeconds: number;
    recordedDeltaSeconds: number;
  };
  meta: any;
  error: any;
}

export function ExamSessionPage() {
  const { examSessionId } = useParams<{ examSessionId: string }>();
  const navigate = useNavigate();
  const { examSession, isLoading, error, handleRetry } = useExamSessionViewModel(examSessionId);

  // Estados de navegación e interacción
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [correction, setCorrection] = useState<CorrectionFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Estados de la UI del Modo Enfoque
  const [isTimerOpen, setIsTimerOpen] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedSecondsRef = useRef(0);
  const activityBaseStartedAtRef = useRef(Date.now());
  const lastSyncedElapsedSecondsRef = useRef(0);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const sessionQuestions = examSession?.questions;
  const isExamClosed = Boolean(
    examSession &&
      (examSession.status === "COMPLETED" ||
        examSession.status === "ABANDONED" ||
        examSession.finishedAt)
  );

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Determinar la primera pregunta sin responder al cargar
  useEffect(() => {
    if (examSession && currentQuestionIndex === null) {
      const firstUnanswered = examSession.questions.findIndex((q) => !q.answered);
      setCurrentQuestionIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
    }
  }, [examSession, currentQuestionIndex]);

  // Limpiar el estado de la pregunta al cambiar de índice y resetear el temporizador.
  // Si la pregunta ya fue respondida (sesión completada o retomada), precarga la respuesta.
  useEffect(() => {
    if (!sessionQuestions) {
      return;
    }

    const q = sessionQuestions[currentQuestionIndex ?? 0];
    if (q?.answered && q.userAnswer) {
      setUserAnswer(q.userAnswer);
      if (q.correction) {
        setCorrection({
          score: q.score ?? 0,
          isCorrect: q.isCorrect ?? false,
          summary: q.correction.feedback.slice(0, 60),
          feedback: q.correction.feedback,
          detectedErrors: (q.correction.detectedErrors as string[]) ?? [],
          missingKeywords: (q.correction.missingKeywords as string[]) ?? [],
          suggestions: (q.correction.suggestions as string[]) ?? [],
          recommendedTopics: []
        });
      }
    } else {
      setUserAnswer("");
      setCorrection(null);
    }
    setSubmitError(null);
  }, [currentQuestionIndex, sessionQuestions]);

  // Cronómetro del examen
  useEffect(() => {
    if (!examSession?.startedAt) return;

    if (isExamClosed) {
      if (examSession.totalTimeSeconds > 0) {
        setElapsedSeconds(examSession.totalTimeSeconds);
        return;
      }

      if (examSession.finishedAt) {
        const startedTime = new Date(examSession.startedAt).getTime();
        const finishedTime = new Date(examSession.finishedAt).getTime();
        const diff = Math.floor((finishedTime - startedTime) / 1000);
        setElapsedSeconds(diff >= 0 ? diff : 0);
      }
      return;
    }

    activityBaseStartedAtRef.current = Date.now();
    lastSyncedElapsedSecondsRef.current = examSession.totalTimeSeconds ?? 0;
    setElapsedSeconds(examSession.totalTimeSeconds ?? 0);

    const updateTimer = () => {
      const activeDiff = Math.floor((Date.now() - activityBaseStartedAtRef.current) / 1000);
      setElapsedSeconds((examSession.totalTimeSeconds ?? 0) + Math.max(0, activeDiff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [
    examSession?.finishedAt,
    examSession?.startedAt,
    examSession?.status,
    examSession?.totalTimeSeconds,
    isExamClosed
  ]);

  const syncExamActivity = useCallback(async () => {
    if (!examSessionId || isExamClosed) {
      return;
    }

    const elapsed = elapsedSecondsRef.current;
    if (elapsed <= lastSyncedElapsedSecondsRef.current) {
      return;
    }

    try {
      const response = await apiService.patch<SyncExamActivityApiResponse>(
        `/exam-sessions/${examSessionId}/activity`,
        {
          elapsedSeconds: elapsed
        }
      );
      lastSyncedElapsedSecondsRef.current = response.data.totalTimeSeconds;
    } catch (err) {
      console.warn("No se pudo sincronizar el tiempo de estudio:", err);
    }
  }, [examSessionId, isExamClosed]);

  useEffect(() => {
    if (!examSessionId || isExamClosed) {
      return;
    }

    const interval = setInterval(() => {
      syncExamActivity();
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        syncExamActivity();
      }
    };
    const handleBeforeUnload = () => {
      syncExamActivity();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      syncExamActivity();
    };
  }, [examSessionId, isExamClosed, syncExamActivity]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#07111F] space-y-4">
        <Loader2 size={44} className="animate-spin text-brand-blue" />
        <span className="text-sm font-bold text-slate-400">Iniciando modo enfoque...</span>
      </div>
    );
  }

  if (error || !examSession) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-[#07111F] p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0E1B2F] border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="font-bold text-red-650 dark:text-red-400 text-base">Error de carga</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || "No se encontró el examen."}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleRetry()}
              className="px-4 py-2 border border-red-300 dark:border-red-900/40 rounded-xl text-sm font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-300 transition cursor-pointer"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = examSession.questions;
  const currentIdx = currentQuestionIndex ?? 0;
  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  if (totalQuestions === 0 || !currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 p-4 dark:bg-[#07111F]">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-xl dark:border-amber-900/30 dark:bg-[#0E1B2F]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-base font-bold text-amber-650 dark:text-amber-400">
            Este examen todavía no tiene preguntas cargadas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vuelve a la lista de exámenes e intenta iniciar otro simulacro.
          </p>
          <button
            onClick={() => navigate("/official-exams")}
            className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90"
          >
            Volver a exámenes oficiales
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((questions.filter((q) => q.answered).length / totalQuestions) * 100);

  // Formatear cronómetro
  const remainingSeconds = examSession.durationLimitSeconds
    ? Math.max(0, examSession.durationLimitSeconds - elapsedSeconds)
    : elapsedSeconds;
  const timerDisplaySeconds = isExamClosed ? elapsedSeconds : remainingSeconds;

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0")
    ].join(":");
  };

  const isQuestionAnswered = currentQuestion?.answered || !!correction;
  const hasWrittenAnswer = userAnswer.trim().length > 0;
  const canEvaluateCurrentQuestion = !isExamClosed && !isQuestionAnswered && hasWrittenAnswer && !isSubmitting;
  const nextActionLabel = currentIdx === totalQuestions - 1 ? "Finalizar Examen" : "Siguiente pregunta";

  // Enviar respuesta
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExamClosed || isQuestionAnswered) {
      return;
    }
    if (!userAnswer.trim()) {
      setSubmitError("Por favor, escribe una respuesta.");
      return;
    }
    if (userAnswer.trim().length < 8) {
      setSubmitError("Tu respuesta es demasiado corta (mínimo 8 caracteres).");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setCorrection(null);

    try {
      await syncExamActivity();

      const response = await apiService.post<EvaluateWrittenAnswerApiResponse>(
        "/corrections/evaluate-written-answer",
        {
          questionId: currentQuestion.questionId,
          userAnswer: userAnswer.trim(),
          examSessionId: examSession.id,
          timeSpentSeconds: 0
        }
      );

      setCorrection({
        ...response.data.correction,
        detectedErrors: response.data.correction.detectedErrors ?? [],
        missingKeywords: response.data.correction.missingKeywords ?? [],
        suggestions: response.data.correction.suggestions ?? [],
        recommendedTopics: response.data.correction.recommendedTopics ?? []
      });
      // Recargar datos de sesión para actualizar el estado "answered"
      handleRetry();
    } catch (err: any) {
      setSubmitError(err.message || "No se pudo evaluar la respuesta con la IA.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Avanzar a la siguiente pregunta
  const handleNext = () => {
    syncExamActivity();
    if (currentIdx < totalQuestions - 1) {
      setCurrentQuestionIndex(currentIdx + 1);
    } else {
      setShowExitConfirmation(true);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await syncExamActivity();
      await apiService.patch(`/exam-sessions/${examSessionId}/finish`, {
        totalTimeSeconds: elapsedSeconds
      });
      setShowExitConfirmation(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error finishing exam:", err);
      navigate("/dashboard");
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-100 dark:bg-[#07111F] text-slate-800 dark:text-slate-200 p-4 md:p-6 lg:p-8 flex flex-col font-sans select-none">
      <div className="w-full max-w-6xl mx-auto flex-1 bg-white dark:bg-[#0E1B2F] rounded-3xl border border-slate-200 dark:border-brand-navy/20 shadow-2xl flex flex-col overflow-hidden">
      
      {/* ── CABECERA DEL MODO ENFOQUE ── */}
      <header className="h-16 px-6 bg-white dark:bg-[#0E1B2F] border-b border-slate-200 dark:border-brand-navy/30 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-brand-sky dark:bg-brand-blue/15 text-brand-blue dark:text-brand-cyan">
            <FileText size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black text-brand-navy dark:text-white leading-tight max-w-[200px] sm:max-w-md truncate">
              {examSession.title}
            </h2>
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              {isExamClosed ? "Modo Revisión" : "Modo Enfoque"} · {currentIdx + 1} de {totalQuestions} preguntas
            </p>
          </div>
        </div>

        {/* Cronómetro Interactiva */}
        <div className="flex items-center bg-slate-100 dark:bg-[#12243B] rounded-full p-1 border border-slate-250 dark:border-brand-navy/20 shadow-xs">
          <button
            onClick={() => setIsTimerOpen(!isTimerOpen)}
            className="p-1.5 rounded-full text-slate-500 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-none"
            title={isTimerOpen ? "Ocultar tiempo" : "Mostrar tiempo"}
          >
            <Clock size={15} />
          </button>
          {isTimerOpen && (
            <span className="px-3 text-xs font-black font-mono tracking-widest text-slate-700 dark:text-slate-200">
              {formatTime(timerDisplaySeconds)}
            </span>
          )}
        </div>

        {/* Botón Salir (X) */}
        <button
          onClick={() => setShowExitConfirmation(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer focus:outline-none"
          title="Salir del examen"
        >
          <X size={18} />
        </button>
      </header>

      {/* ── CONTENIDO PRINCIPAL: DOS COLUMNAS ── */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* COLUMNA IZQUIERDA: PREGUNTA Y APORTACIÓN DEL ESTUDIANTE */}
        <section className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-brand-navy/15">
          
          {/* NÚMEROS DE PREGUNTA / NAVEGADOR DE PROGRESO */}
          <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start pb-4 border-b border-slate-200 dark:border-brand-navy/10">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer focus:outline-none ${
                  currentIdx === idx
                    ? "bg-brand-blue text-white ring-2 ring-brand-blue/30 scale-105"
                    : q.answered
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                    : "bg-slate-100 dark:bg-[#12243B] text-slate-450 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/25 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Cabecera de la tarjeta de la pregunta */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy/10 pb-3">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-brand-sky dark:bg-brand-blue/15 text-brand-blue dark:text-brand-cyan uppercase tracking-wider">
                Pregunta {currentIdx + 1}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-450">
                Dificultad: {currentQuestion.difficulty}
              </span>
            </div>

            {/* Enunciado de la Pregunta */}
            <div className="space-y-2 text-left">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <HelpCircle size={14} className="text-brand-blue" />
                <span>Enunciado</span>
              </h3>
              <MathText
                value={currentQuestion.statement}
                className="text-base text-slate-900 dark:text-slate-100 font-semibold leading-relaxed"
              />
              {currentQuestion.sourceExam && (
                <span className="text-[10px] font-bold text-slate-400 block mt-1">
                  Fuente: {currentQuestion.sourceExam} {currentQuestion.sourceYear ? `(${currentQuestion.sourceYear})` : ""}
                </span>
              )}
            </div>
          </div>

          {/* Formulario / Input del Approach */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="approach-input" className="block text-sm font-black text-slate-700 dark:text-slate-350">
                Tu desarrollo o razonamiento (Approach)
              </label>
              {currentQuestion.answered && !correction && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-lg">
                  <CheckCircle2 size={11} />
                  Ya respondida
                </span>
              )}
            </div>

            {currentQuestion.answered && !correction && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-100 dark:bg-[#12243B]/40 p-3 rounded-xl border border-slate-200/50 dark:border-brand-navy/10">
                Esta pregunta ya fue evaluada en esta sesión. Puedes revisar tu desarrollo y avanzar cuando quieras, pero la IA solo genera una evaluación por pregunta.
              </p>
            )}

            <form id="exam-session-answer-form" onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                id="approach-input"
                rows={7}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Escribe aquí tu desarrollo paso a paso..."
                disabled={isSubmitting || isExamClosed || isQuestionAnswered}
                className="block w-full p-4 border border-slate-200 dark:border-brand-navy/30 rounded-2xl bg-white dark:bg-[#0E1B2F] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all resize-none shadow-xs font-medium"
              />

              <AnswerAttachmentComposer
                key={currentQuestion.id}
                disabled={isSubmitting || isExamClosed || isQuestionAnswered}
              />

              {submitError && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-650 dark:text-red-455 text-xs font-bold">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* COLUMNA DERECHA: RESULTADO DE LA IA */}
        <section className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-100/50 dark:bg-[#091526]/50 flex flex-col justify-start">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-1.5 text-left shrink-0">
            <Brain size={15} className="text-brand-blue" />
            <span>Resultado de la evaluación</span>
          </h3>

          <div className="flex-1 flex flex-col justify-start">
            {correction ? (
              <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl shadow-sm overflow-hidden animate-slide-up flex flex-col">
                {/* Cabecera de la Corrección */}
                <div className={`p-5 text-center text-white space-y-2 shrink-0 ${
                  correction.isCorrect
                    ? "bg-gradient-to-r from-green-600 to-green-500"
                    : "bg-gradient-to-r from-red-600 to-red-500"
                }`}>
                  <div className="mx-auto w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    {correction.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm uppercase tracking-wide">Evaluación de la IA</h4>
                    <p className="text-[11px] font-semibold opacity-90 mt-0.5">{correction.summary}</p>
                  </div>
                  <div className="inline-block bg-white/20 px-3.5 py-1 rounded-full font-black text-lg tracking-tight">
                    Calificación: {correction.score} / 10
                  </div>
                </div>

                {/* Detalles del Feedback */}
                <div className="p-5 space-y-4 text-left">
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retroalimentación</h5>
                    <MathText
                      value={correction.feedback}
                      className="text-xs text-slate-700 dark:text-slate-350 font-semibold leading-relaxed"
                    />
                  </div>

                  {/* Errores Detectados */}
                  {correction.detectedErrors.length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 dark:border-brand-navy/10 pt-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1">
                        <AlertTriangle size={12} className="text-red-500" />
                        <span>Errores detectados</span>
                      </h5>
                      <ul className="space-y-1">
                        {correction.detectedErrors.map((err, i) => (
                          <li key={i} className="text-[11px] font-bold text-red-650 dark:text-red-400 pl-3 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-500">
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Conceptos Omitidos */}
                  {correction.missingKeywords.length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 dark:border-brand-navy/10 pt-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1">
                        <Key size={12} className="text-amber-500" />
                        <span>Conceptos omitidos</span>
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {correction.missingKeywords.map((kw, i) => (
                          <span key={i} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {correction.suggestions.length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 dark:border-brand-navy/10 pt-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1">
                        <ListChecks size={12} className="text-brand-blue" />
                        <span>Recomendaciones de mejora</span>
                      </h5>
                      <ul className="space-y-1">
                        {correction.suggestions.map((sug, i) => (
                          <li key={i} className="text-[11px] font-semibold text-slate-650 dark:text-slate-400 pl-3 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand-blue">
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : isSubmitting ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/20 rounded-2xl shadow-xs min-h-[300px]">
                <Loader2 size={32} className="animate-spin text-brand-blue mb-3" />
                <span className="text-xs font-black text-slate-500 dark:text-slate-350 uppercase tracking-wider">
                  Analizando tu respuesta...
                </span>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 max-w-[200px] mt-1 leading-relaxed">
                  Nuestra Inteligencia Artificial está evaluando tu desarrollo paso a paso. Tardará unos segundos.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 bg-white/50 dark:bg-[#0E1B2F]/20 border-2 border-dashed border-slate-250 dark:border-brand-navy/15 rounded-2xl min-h-[300px]">
                <Brain size={40} className="text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
                <h4 className="font-black text-xs text-slate-500 dark:text-slate-350 uppercase tracking-wider">Esperando solución</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 max-w-[220px] mx-auto mt-1 leading-relaxed">
                  Redacta tu solución o approach en el panel izquierdo y haz clic en enviar para ver la retroalimentación detallada.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── BARRA INFERIOR DE ACCIÓN ── */}
      <footer className="min-h-20 px-6 py-3 bg-white dark:bg-[#0E1B2F] border-t border-slate-200 dark:border-brand-navy/30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0 z-10">
        <div className="flex items-center space-x-4">
          {/* Porcentaje de Progreso */}
          <div className="hidden md:block text-left">
            <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <span>Progreso del Examen</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-40 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => currentIdx > 0 && setCurrentQuestionIndex(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="px-4 h-11 border border-slate-200 dark:border-brand-navy/35 rounded-xl text-xs font-black text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer focus:outline-none flex items-center justify-center"
          >
            Anterior
          </button>

          {isQuestionAnswered ? (
            <button
              onClick={handleNext}
              className="px-5 h-11 bg-brand-blue text-white rounded-xl text-xs font-black hover:bg-brand-blue/90 transition cursor-pointer focus:outline-none flex items-center justify-center shadow-md shadow-brand-blue/15"
            >
              <span>{nextActionLabel}</span>
              <ChevronRight size={14} className="ml-1 flex-shrink-0" />
            </button>
          ) : (
            <>
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-5 h-11 border border-slate-200 dark:border-brand-navy/35 bg-white dark:bg-transparent text-slate-650 dark:text-slate-300 rounded-xl text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35 transition cursor-pointer focus:outline-none flex items-center justify-center"
              >
                <span>{nextActionLabel}</span>
                <ChevronRight size={14} className="ml-1 flex-shrink-0" />
              </button>

              <button
                type="submit"
                form="exam-session-answer-form"
                disabled={!canEvaluateCurrentQuestion}
                className="px-5 h-11 bg-brand-blue text-white rounded-xl text-xs font-black hover:bg-brand-blue/90 disabled:opacity-40 disabled:hover:bg-brand-blue transition cursor-pointer focus:outline-none flex items-center justify-center shadow-md shadow-brand-blue/15"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin mr-2" />
                    <span>Evaluando...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} className="mr-2" />
                    <span>Enviar solución a evaluar</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </footer>
      </div>

      {/* ── MODAL DE CONFIRMACIÓN DE SALIDA ── */}
      {showExitConfirmation && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200/80 dark:border-brand-navy/35 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-in">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <HelpCircle size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-brand-navy dark:text-white">
                {currentIdx === totalQuestions - 1 && isQuestionAnswered
                  ? "¿Deseas finalizar el examen?"
                  : "¿Quieres salir del examen?"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {currentIdx === totalQuestions - 1 && isQuestionAnswered
                  ? "Has completado todas las preguntas. Tu progreso quedará guardado para tu estudio."
                  : "Tu progreso se guardará y podrás continuar en cualquier otro momento."}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={async () => {
                  if (currentIdx === totalQuestions - 1 && isQuestionAnswered) {
                    handleFinish();
                  } else {
                    await syncExamActivity();
                    setShowExitConfirmation(false);
                    navigate("/dashboard");
                  }
                }}
                disabled={isFinishing}
                className="w-full py-2.5 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-sm shadow-red-500/10 focus:outline-none disabled:opacity-70"
              >
                {isFinishing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Guardando...
                  </span>
                ) : currentIdx === totalQuestions - 1 && isQuestionAnswered ? (
                  "Sí, finalizar"
                ) : (
                  "Sí, salir"
                )}
              </button>
              <button
                onClick={() => setShowExitConfirmation(false)}
                className="w-full py-2.5 border border-slate-200 dark:border-brand-navy/35 rounded-xl text-xs font-black text-slate-650 dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer focus:outline-none flex items-center justify-center"
              >
                Cancelar y seguir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
