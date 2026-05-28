import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuestionViewModel } from "../viewmodels/useQuestionViewModel";
import {
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Key,
  ListChecks,
  HelpCircle,
  Brain,
  ChevronRight,
  X
} from "lucide-react";
import { MathText } from "../shared/components/MathText";

export function QuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { questionIds?: string[]; examId?: string; initialTimeSeconds?: number; selectedTopicId?: string | null; mode?: 'practice' | 'review'; reviewAnswers?: Record<string, any> } | null;
  const questionIds = state?.questionIds || [];
  const currentIdx = questionIds.indexOf(questionId || "");
  const hasMultipleQuestions = questionIds.length > 0 && currentIdx !== -1;
  const examId = state?.examId || questionId;
  const isReviewMode = state?.mode === 'review';

  const [isTimerOpen, setIsTimerOpen] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (isReviewMode) return state?.initialTimeSeconds || 0;
    if (!examId) return state?.initialTimeSeconds || 0;
    const stored = localStorage.getItem(`exam_time_${examId}`);
    return stored ? parseInt(stored, 10) : (state?.initialTimeSeconds || 0);
  });
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const {
    question,
    isLoading,
    error,
    userAnswer,
    setUserAnswer,
    correction,
    setCorrection,
    isSubmitting,
    submitError,
    handleSubmitAnswer,
    handleReset,
    handleRetry,
  } = useQuestionViewModel(questionId);

  // Serialize reviewAnswers for stable dependency comparison
  const reviewAnswersJson = isReviewMode && state?.reviewAnswers ? JSON.stringify(state.reviewAnswers) : null;

  useEffect(() => {
    if (questionId && examId && !isLoading) {
      if (isReviewMode && reviewAnswersJson) {
        const reviewAnswers = JSON.parse(reviewAnswersJson);
        const answerObj = reviewAnswers[questionId];
        if (answerObj) {
          setUserAnswer(answerObj.userAnswer || "");
          setCorrection(answerObj.correction || null);
        } else {
          setUserAnswer("");
          setCorrection(null);
        }
      } else {
        const activeRunStr = localStorage.getItem(`active_run_${examId}`);
        if (activeRunStr) {
          const data = JSON.parse(activeRunStr);
          const questionData = data[questionId];
          if (questionData) {
            setUserAnswer(questionData.userAnswer || "");
            setCorrection(questionData.correction || null);
          } else {
            setUserAnswer("");
            setCorrection(null);
          }
        } else {
          setUserAnswer("");
          setCorrection(null);
        }
      }
    }
  }, [questionId, examId, isLoading, setUserAnswer, setCorrection, isReviewMode, reviewAnswersJson]);

  useEffect(() => {
    if (correction && questionId && examId && question?.statement && !isReviewMode) {
      const activeRunStr = localStorage.getItem(`active_run_${examId}`);
      const activeRun = activeRunStr ? JSON.parse(activeRunStr) : {};
      activeRun[questionId] = {
        statement: question.statement,
        userAnswer: userAnswer,
        correction: correction
      };
      localStorage.setItem(`active_run_${examId}`, JSON.stringify(activeRun));
    }
  }, [correction, questionId, examId, question?.statement, userAnswer, isReviewMode]);

  useEffect(() => {
    if (isReviewMode) return;
    const stored = examId ? localStorage.getItem(`exam_time_${examId}`) : null;
    const startSecs = stored ? parseInt(stored, 10) : (state?.initialTimeSeconds || 0);
    setElapsedSeconds(startSecs);
    
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextSecs = prev + 1;
        if (examId) {
          localStorage.setItem(`exam_time_${examId}`, nextSecs.toString());
        }
        return nextSecs;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [examId, state?.initialTimeSeconds, isReviewMode]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#07111F] space-y-4">
        <Loader2 size={44} className="animate-spin text-brand-blue" />
        <span className="text-sm font-bold text-slate-400">Iniciando modo enfoque...</span>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-[#07111F] p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0E1B2F] border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-650 mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="font-bold text-red-650 dark:text-red-400 text-base">Error al cargar la pregunta</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleRetry()}
              className="px-4 py-2 border border-red-300 dark:border-red-900/40 rounded-xl text-sm font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-300 transition cursor-pointer"
            >
              Volver atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const saveCompletedRun = () => {
    if (!examId) return;
    const activeRunStr = localStorage.getItem(`active_run_${examId}`);
    if (!activeRunStr) return;
    
    const activeRun = JSON.parse(activeRunStr);
    const answersKeys = Object.keys(activeRun);
    if (answersKeys.length === 0) return;
    
    const totalScore = answersKeys.reduce((sum, key) => sum + (activeRun[key].correction?.score || 0), 0);
    const avgScore = Math.round((totalScore / answersKeys.length) * 10) / 10;
    
    const completedRun = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      timeSeconds: elapsedSeconds,
      score: avgScore,
      answers: activeRun
    };
    
    const historicalRunsStr = localStorage.getItem(`exam_results_${examId}`);
    const historicalRuns = historicalRunsStr ? JSON.parse(historicalRunsStr) : [];
    historicalRuns.push(completedRun);
    
    localStorage.setItem(`exam_results_${examId}`, JSON.stringify(historicalRuns));
    localStorage.removeItem(`active_run_${examId}`);
  };

  const handleNext = () => {
    if (hasMultipleQuestions && currentIdx < questionIds.length - 1) {
      const nextId = questionIds[currentIdx + 1];
      navigate(`/questions/${nextId}`, {
        state: {
          questionIds,
          examId,
          initialTimeSeconds: state?.initialTimeSeconds,
          selectedTopicId: state?.selectedTopicId,
          mode: state?.mode,
          reviewAnswers: state?.reviewAnswers,
        }
      });
    } else {
      if (isReviewMode) {
        handleBackToTopics();
      } else if (progressPercent === 100 || (!hasMultipleQuestions && isQuestionAnswered)) {
        saveCompletedRun();
        handleBackToTopics();
      } else {
        setShowExitConfirmation(true);
      }
    }
  };

  const handleBackToTopics = () => {
    navigate(`/subjects/${question.subjectId || "general"}/topics`, {
      state: { selectedTopicId: state?.selectedTopicId }
    });
  };

  const isQuestionAnswered = !!correction;
  const progressPercent = hasMultipleQuestions
    ? Math.round(((currentIdx + (isQuestionAnswered ? 1 : 0)) / questionIds.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-100 dark:bg-[#07111F] text-slate-800 dark:text-slate-200 p-4 md:p-6 lg:p-8 flex flex-col font-sans select-none">
      <div className="w-full max-w-6xl mx-auto flex-1 bg-white dark:bg-[#0E1B2F] rounded-3xl border border-slate-200 dark:border-brand-navy/20 shadow-2xl flex flex-col overflow-hidden">
      
      <header className="h-16 px-6 bg-white dark:bg-[#0E1B2F] border-b border-slate-200 dark:border-brand-navy/30 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-brand-sky dark:bg-brand-blue/15 text-brand-blue dark:text-brand-cyan">
            <Brain size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black text-brand-navy dark:text-white leading-tight max-w-[200px] sm:max-w-md truncate">
              {isReviewMode ? "Revisión de Práctica" : "Práctica de la Asignatura"}
            </h2>
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              {hasMultipleQuestions
                ? `Pregunta ${currentIdx + 1} de ${questionIds.length}`
                : "Pregunta Individual"}
            </p>
          </div>
        </div>

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
              {formatTime(elapsedSeconds)}
            </span>
          )}
        </div>

        <button
          onClick={() => isReviewMode ? handleBackToTopics() : setShowExitConfirmation(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer focus:outline-none"
          title="Salir de la práctica"
        >
          <X size={18} />
        </button>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        <section className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-brand-navy/15">
          
          {hasMultipleQuestions && (
            <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start pb-4 border-b border-slate-200 dark:border-brand-navy/10">
              {questionIds.map((id, idx) => (
                <button
                  key={id}
                  onClick={() => navigate(`/questions/${id}`, {
                    state: {
                      questionIds,
                      examId,
                      initialTimeSeconds: state?.initialTimeSeconds,
                      selectedTopicId: state?.selectedTopicId,
                      mode: state?.mode
                    }
                  })}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer focus:outline-none ${
                    currentIdx === idx
                      ? "bg-brand-blue text-white ring-2 ring-brand-blue/30 scale-105"
                      : "bg-slate-100 dark:bg-[#12243B] text-slate-450 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/25 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy/10 pb-3">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-brand-sky dark:bg-brand-blue/15 text-brand-blue dark:text-brand-cyan uppercase tracking-wider">
                {question.type}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-450">
                Dificultad: {question.difficulty}
              </span>
            </div>

            <div className="space-y-2 text-left">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <HelpCircle size={14} className="text-brand-blue" />
                <span>Enunciado</span>
              </h3>
              <MathText
                value={question.statement}
                className="text-base text-slate-900 dark:text-slate-100 font-semibold leading-relaxed"
              />
              {question.sourceExam && (
                <span className="text-[10px] font-bold text-slate-400 block mt-1">
                  Fuente: {question.sourceExam} {question.sourceYear ? `(${question.sourceYear})` : ""}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 text-left">
            <label htmlFor="practice-approach-input" className="block text-sm font-black text-slate-700 dark:text-slate-350">
              {isReviewMode ? "Tu respuesta original" : "Tu solución o razonamiento (Approach)"}
            </label>

            {correction && !isReviewMode ? (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-[#12243B] rounded-2xl text-sm text-slate-650 dark:text-slate-350 border border-slate-100 dark:border-brand-navy/10 whitespace-pre-wrap font-medium">
                  {userAnswer}
                </div>
                 <button
                  onClick={() => {
                    if (examId && questionId) {
                      const activeRunStr = localStorage.getItem(`active_run_${examId}`);
                      if (activeRunStr) {
                        const activeRun = JSON.parse(activeRunStr);
                        delete activeRun[questionId];
                        localStorage.setItem(`active_run_${examId}`, JSON.stringify(activeRun));
                      }
                    }
                    handleReset();
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-brand-navy/35 rounded-xl text-xs font-black text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Volver a intentar
                </button>
              </div>
            ) : isReviewMode ? (
              <div className="p-4 bg-slate-50 dark:bg-[#12243B] rounded-2xl text-sm text-slate-650 dark:text-slate-350 border border-slate-100 dark:border-brand-navy/10 whitespace-pre-wrap font-medium">
                {userAnswer}
              </div>
            ) : (
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <textarea
                  id="practice-approach-input"
                  rows={8}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Redacta paso a paso tu razonamiento matemático o desarrollo científico aquí..."
                  disabled={isSubmitting}
                  className="block w-full p-4 border border-slate-200 dark:border-brand-navy/30 rounded-2xl bg-white dark:bg-[#0E1B2F] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all resize-none shadow-xs font-medium"
                />

                {submitError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-650 dark:text-red-455 text-xs font-bold">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !userAnswer.trim()}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-sm font-black text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-40 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      <span>Evaluando solución con IA...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} className="mr-2" />
                      <span>Enviar solución a evaluar</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

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
      <footer className="h-20 px-6 bg-white dark:bg-[#0E1B2F] border-t border-slate-200 dark:border-brand-navy/30 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-4">
          {/* Porcentaje de Progreso (si hay múltiples preguntas) */}
          {hasMultipleQuestions && (
            <div className="hidden md:block text-left">
              <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <span>Progreso de Práctica</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-40 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Botones de navegación */}
        <div className="flex space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={() =>
              hasMultipleQuestions &&
              currentIdx > 0 &&
              navigate(`/questions/${questionIds[currentIdx - 1]}`, {
                state: {
                  questionIds,
                  examId,
                  initialTimeSeconds: state?.initialTimeSeconds,
                  selectedTopicId: state?.selectedTopicId,
                  mode: state?.mode,
                  reviewAnswers: state?.reviewAnswers,
                }
              })
            }
            disabled={!hasMultipleQuestions || currentIdx === 0}
            className="px-4 h-11 border border-slate-200 dark:border-brand-navy/35 rounded-xl text-xs font-black text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 disabled:hover:bg-transparent transition cursor-pointer focus:outline-none flex items-center justify-center"
          >
            Anterior
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isReviewMode && !isQuestionAnswered && hasMultipleQuestions}
            className="px-5 h-11 bg-brand-blue text-white rounded-xl text-xs font-black hover:bg-brand-blue/90 disabled:opacity-40 disabled:hover:bg-brand-blue transition cursor-pointer focus:outline-none flex items-center justify-center shadow-md shadow-brand-blue/15"
          >
            <span>
              {!hasMultipleQuestions || currentIdx === questionIds.length - 1
                ? (isReviewMode ? "Finalizar Revisión" : "Finalizar Práctica")
                : "Siguiente pregunta"}
            </span>
            <ChevronRight size={14} className="ml-1 flex-shrink-0" />
          </button>
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
                ¿Deseas salir de la práctica?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Podrás volver a acceder a estas preguntas desde el catálogo de la asignatura.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowExitConfirmation(false);
                  handleBackToTopics();
                }}
                className="w-full py-2.5 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-sm shadow-red-500/10 focus:outline-none"
              >
                Sí, finalizar práctica
              </button>
              <button
                onClick={() => setShowExitConfirmation(false)}
                className="w-full py-2.5 border border-slate-200 dark:border-brand-navy/35 rounded-xl text-xs font-black text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer focus:outline-none"
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
