import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTopicsQuestionsViewModel } from "../viewmodels/useTopicsQuestionsViewModel";
import { apiService } from "../shared/services/api.service";
import { useAuthStore } from "../stores/auth.store";
import { CreatorBadge } from "../shared/components/CreatorBadge";
import {
  ArrowLeft,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Loader2,
  HelpCircle,
  FileText,
  Clock,
  CalendarClock,
  BarChart3,
  Filter,
  Flag,
  ChevronDown,
  ChevronUp,
  History,
  X,
  PlayCircle,
  Trash2
} from "lucide-react";

const formatTimeSeconds = (totalSecs: number): string => {
  if (totalSecs === 0) return "Sin iniciar";
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return [
    hrs.toString().padStart(2, "0"),
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0")
  ].join(":");
};

type ExamFilter = "all" | "active" | "topic";

const getSessionDateValue = (session: any): number => {
  return new Date(session.finishedAt || session.lastActivityAt || session.startedAt || 0).getTime();
};

const scoreMotivationPhrases = {
  red: [
    "Dale %name, solo hay que apretar un poco mas.",
    "Un poco mas de estudio y esto cambia rapido.",
    "%name, este intento no define tu nivel. Volvemos y lo rompemos.",
    "Aqui hay base, falta ordenar mejor el approach.",
    "Respira, repasa el fallo y vuelve a intentarlo.",
    "Todavia no salio, pero estas construyendo el camino.",
    "Ajustamos conceptos y el siguiente intento sube."
  ],
  yellow: [
    "Buah %name, casi lo logras. Sigue intentando.",
    "Estas cerca, falta pulir un par de detalles.",
    "Esto ya empieza a tomar forma.",
    "Buen avance, ahora toca cerrar los errores pequeños.",
    "Vas bien: un repaso mas y pasas al siguiente nivel.",
    "Casi, casi. El approach ya esta mucho mejor.",
    "%name, estas a nada de convertirlo en una respuesta solida."
  ],
  green: [
    "Esto ya se ve mucho mejor, la estas rompiendo.",
    "Muy buen intento, %name. Sigue con ese ritmo.",
    "Ese approach ya huele a examen bien defendido.",
    "Buenisimo, aqui ya hay dominio real.",
    "La respuesta va fuerte. Mantente asi.",
    "%name, esto ya esta para confiar mas en ti."
  ]
};

const getScoreTone = (score: number): keyof typeof scoreMotivationPhrases => {
  if (score < 5) return "red";
  if (score < 7.5) return "yellow";
  return "green";
};

const getScoreBadgeClasses = (score: number): string => {
  const tone = getScoreTone(score);
  if (tone === "red") return "bg-red-500/10 text-red-600 dark:text-red-400";
  if (tone === "yellow") return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-green-500/10 text-green-600 dark:text-green-400";
};

const getMotivationPhrase = (score: number, seed: string, name: string): string => {
  const phrases = scoreMotivationPhrases[getScoreTone(score)];
  const index = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0) % phrases.length;
  return phrases[index].replace("%name", name);
};

/**
 * TopicsPage: Espacio de trabajo de una asignatura.
 * Muestra exámenes disponibles, progreso de intentos y filtros por tema.
 */
export function TopicsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [examFilter, setExamFilter] = useState<ExamFilter>("all");
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [selectedExamForHistory, setSelectedExamForHistory] = useState<{ id: string; title: string; questionIds: string[] } | null>(null);
  const [historySessions, setHistorySessions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const SESSION_STORAGE_KEY = "examina_topic_sessions";
  const studentName = user?.profile?.username || user?.displayName || "crack";

  
  const initialTopicId = location.state?.selectedTopicId || null;

  const {
    topics,
    questions,
    selectedTopicId,
    isLoading,
    error,
    handleToggleTopicFilter,
    handleClearFilters,
    handleRetry,
  } = useTopicsQuestionsViewModel(subjectId, initialTopicId);

  const examSessionsQuery = useQuery<{ data: any[] }, Error>({
    queryKey: ["exam-sessions-me", subjectId],
    queryFn: () => apiService.get<{ data: any[] }>("/exam-sessions/me"),
    enabled: Boolean(subjectId),
    refetchOnMount: true
  });

  const allExamSessions = examSessionsQuery.data?.data ?? [];

  const getStoredSessionId = (examCardId: string): string | null => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const map = JSON.parse(raw);
      return map[examCardId] || null;
    } catch {
      return null;
    }
  };

  const storeSessionId = (examCardId: string, sessionId: string) => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      const map = raw ? JSON.parse(raw) : {};
      map[examCardId] = sessionId;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  };

  const clearStoredSession = (examCardId: string) => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const map = JSON.parse(raw);
      delete map[examCardId];
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  };

  const formatSessionHistoryLabel = (session: any): string => {
    const dateSource = session.finishedAt || session.lastActivityAt || session.startedAt;
    if (!dateSource) return "Intento sin fecha registrada";

    const date = new Date(dateSource);
    const formatted = new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);

    if (session.status === "COMPLETED") return `Terminado · ${formatted}`;
    if (session.status === "ABANDONED") return `Abandonado · ${formatted}`;
    return `En progreso · última actividad ${formatted}`;
  };

  const formatSessionStatus = (status: string): string => {
    if (status === "COMPLETED") return "Terminado";
    if (status === "ABANDONED") return "Abandonado";
    if (status === "DRAFT") return "Borrador";
    return "En progreso";
  };

  const handleDeleteHistorySession = async (sessionId: string) => {
    setDeletingSessionId(sessionId);
    try {
      await apiService.delete(`/exam-sessions/${sessionId}`);
      setHistorySessions((sessions) => sessions.filter((session) => session.id !== sessionId));

      if (selectedExamForHistory) {
        const storedSessionId = getStoredSessionId(selectedExamForHistory.id);
        if (storedSessionId === sessionId) {
          clearStoredSession(selectedExamForHistory.id);
        }
      }

      handleRetry();
      examSessionsQuery.refetch();
    } catch (err) {
      console.error("Error deleting exam session:", err);
      alert("No se pudo eliminar el intento. Inténtalo de nuevo.");
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleOpenHistory = async (examCard: { id: string; title: string; questionIds: string[] }) => {
    setSelectedExamForHistory(examCard);
    setHistoryLoading(true);
    setHistorySessions([]);

    try {
      const response = await apiService.get<{ data: any[] }>("/exam-sessions/me");
      const allSessions = response.data || [];
      const cardQuestionIds = new Set(examCard.questionIds);

      const matching = allSessions.filter((session: any) => {
        const sessionQuestionIds = new Set((session.questions || []).map((q: any) => q.questionId));
        const overlap = [...cardQuestionIds].filter((id) => sessionQuestionIds.has(id));
        return overlap.length > 0;
      }).sort((a: any, b: any) => {
        return getSessionDateValue(b) - getSessionDateValue(a);
      });

      setHistorySessions(matching);
    } catch (err) {
      console.error("Error loading exam history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStartTopicExam = async (examCard: {
    id: string;
    title: string;
    questionIds: string[];
  }) => {
    const createSession = async () => {
      const response = await apiService.post<{ data: { id: string } }>(
        "/exam-sessions",
        {
          title: examCard.title,
          questionIds: examCard.questionIds
        }
      );
      storeSessionId(examCard.id, response.data.id);
      examSessionsQuery.refetch();
      navigate(`/exam-sessions/${response.data.id}`);
    };

    setStartError(null);
    const existingSessionId = getStoredSessionId(examCard.id);
    if (existingSessionId) {
      setStartingExamId(examCard.id);
      try {
        await apiService.get(`/exam-sessions/${existingSessionId}`);
        navigate(`/exam-sessions/${existingSessionId}`);
        return;
      } catch {
        clearStoredSession(examCard.id);
      } finally {
        setStartingExamId(null);
      }
    }

    setStartingExamId(examCard.id);
    try {
      await createSession();
    } catch (err: any) {
      console.error("Error creating exam session:", err);
      setStartError(err.message || "No se pudo iniciar el examen. Inténtalo de nuevo.");
    } finally {
      setStartingExamId(null);
    }
  };

  const handleResetExam = async (examCard: {
    id: string;
    title: string;
    questionIds: string[];
    latestSession: any;
  }) => {
    setIsResetting(examCard.id);
    try {
      const existingSessionId = getStoredSessionId(examCard.id);

      if (existingSessionId && examCard.latestSession?.status !== "COMPLETED") {
        await apiService.delete(`/exam-sessions/${existingSessionId}`);
      }

      localStorage.removeItem(`exam_time_${examCard.id}`);
      localStorage.removeItem(`active_run_${examCard.id}`);
      clearStoredSession(examCard.id);

      const response = await apiService.post<{ data: { id: string } }>(
        "/exam-sessions",
        {
          title: examCard.title,
          questionIds: examCard.questionIds
        }
      );

      storeSessionId(examCard.id, response.data.id);
      handleRetry();
      examSessionsQuery.refetch();
      navigate(`/exam-sessions/${response.data.id}`);
    } catch (err) {
      console.error("Error resetting exam:", err);
      alert("No se pudo reiniciar el progreso. Inténtalo de nuevo.");
    } finally {
      setIsResetting(null);
    }
  };




  const examCards = useMemo(() => {
    const topicNameById = new Map(topics.map((topic) => [topic.id, topic.name]));

    const topicGroups = new Map<string, typeof questions>();
    const groupOrder: string[] = [];

    for (const q of questions) {
      const key = q.topicId || "__no_topic__";
      if (!topicGroups.has(key)) {
        topicGroups.set(key, []);
        groupOrder.push(key);
      }
      topicGroups.get(key)!.push(q);
    }

    return groupOrder.map((key) => {
      const groupQuestions = topicGroups.get(key)!;
      const totalCount = groupQuestions.length;
      const topicName = key === "__no_topic__" ? null : topicNameById.get(key);

      const title = topicName
        ? `Examen de ${topicName}`
        : "Banco de preguntas";

      const description = topicName
        ? `Examen centrado en ${topicName}. ${totalCount} preguntas tipo PAU/Selectividad para practicar este tema en profundidad.`
        : `${totalCount} preguntas variadas de la asignatura para practicar.`;

      const cardId = topicName
        ? `exam-topic-${key}`
        : `exam-ungrouped-${groupQuestions[0]?.subjectId || "unknown"}`;
      const questionIds = groupQuestions.map((q) => q.id);
      const questionIdSet = new Set(questionIds);
      const matchingSessions = allExamSessions
        .filter((session: any) => {
          const sessionQuestionIds = new Set((session.questions || []).map((q: any) => q.questionId));
          return [...questionIdSet].some((id) => sessionQuestionIds.has(id));
        })
        .sort((a: any, b: any) => getSessionDateValue(b) - getSessionDateValue(a));
      const latestSession = matchingSessions[0] ?? null;
      const latestAnsweredCount = latestSession
        ? (latestSession.questions || []).filter((question: any) => question.answered).length
        : 0;
      const latestTotalQuestions = latestSession?.questions?.length || totalCount;
      const progress = latestSession
        ? Math.round((latestAnsweredCount / latestTotalQuestions) * 100)
        : 0;
      const latestDate = latestSession
        ? new Date(latestSession.finishedAt || latestSession.lastActivityAt || latestSession.startedAt)
        : null;
      const latestDateLabel = latestDate
        ? new Intl.DateTimeFormat("es-ES", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          }).format(latestDate)
        : null;
      const latestScores = latestSession
        ? (latestSession.questions || [])
            .filter((question: any) => question.score != null)
            .map((question: any) => question.score)
        : [];
      const latestAverageScore =
        latestScores.length > 0
          ? (latestScores.reduce((total: number, score: number) => total + score, 0) / latestScores.length).toFixed(1)
          : null;
      const latestAverageScoreNumber = latestAverageScore ? Number(latestAverageScore) : null;
      const latestStatusLabel = latestSession
        ? formatSessionStatus(latestSession.status)
        : "Sin empezar";
      const latestMotivationPhrase =
        latestSession && latestAverageScoreNumber != null
          ? getMotivationPhrase(latestAverageScoreNumber, latestSession.id, studentName)
          : null;

      return {
        id: cardId,
        title,
        description,
        type: topicName ? "topic" : "complete",
        progress,
        elapsedTime: latestSession ? formatTimeSeconds(latestSession.totalTimeSeconds ?? 0) : "Sin iniciar",
        lastOpened: latestSession
          ? latestSession.status === "COMPLETED"
            ? `Terminado ${latestDateLabel}`
            : `Última vez ${latestDateLabel}`
          : "Sin intentos",
        questionCount: totalCount,
        questionIds,
        historicalRuns: [] as any[],
        hasHistory: matchingSessions.length > 0,
        latestSession,
        latestAverageScore,
        latestAverageScoreNumber,
        latestStatusLabel,
        latestMotivationPhrase,
        ownerName: "Equipo ExamInA"
      };
    });
  }, [allExamSessions, questions, studentName, topics]);

  const filteredExamCards = examCards.filter((exam) => {
    if (examFilter === "active") return exam.progress > 0 && exam.progress < 100;
    if (examFilter === "topic") return exam.type === "topic";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Botón de Retorno */}
      <div className="flex justify-between items-center">
        <Link
          to="/subjects"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Volver a asignaturas</span>
        </Link>
      </div>

      {/* Estado: Cargando */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={36} className="animate-spin text-brand-blue" />
          <span className="text-sm font-semibold text-slate-400">Cargando exámenes de la asignatura...</span>
        </div>
      )}

      {/* Estado: Error */}
      {error && (
        <div className="max-w-md mx-auto bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-650 dark:text-red-400 mx-auto">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-red-650 dark:text-red-400 text-base">Error al cargar datos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-900/40 rounded-xl text-sm font-bold text-red-650 dark:text-red-450 hover:bg-red-100/50 dark:hover:bg-red-950/50 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className="mr-2" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Contenido principal */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Temas (Filtros) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="text-left mb-6">
              <h2 className="text-lg font-black text-brand-navy dark:text-white tracking-tight flex items-center space-x-2">
                <BookOpen size={18} className="text-brand-blue" />
                <span>Temas de la materia</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Usa los temas para filtrar exámenes y bloques de práctica.
              </p>
            </div>

            {topics.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-brand-navy/20 rounded-2xl text-xs text-slate-400">
                No hay temas registrados para esta asignatura.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {topics.map((topic) => {
                  const isActive = selectedTopicId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleToggleTopicFilter(topic.id)}
                      className={`text-left p-4 rounded-xl border text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? "bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20"
                          : "bg-white dark:bg-[#0E1B2F] border-slate-200 dark:border-brand-navy/30 text-slate-700 dark:text-slate-300 hover:border-brand-blue/35"
                      }`}
                    >
                      <span className="truncate pr-2">{topic.name}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Exámenes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-4 border-b border-slate-200 dark:border-brand-navy/15 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-brand-navy dark:text-white tracking-tight flex items-center space-x-2">
                    <FileText size={20} className="text-brand-blue" />
                    <span>Exámenes de la asignatura</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Continúa intentos abiertos, revisa tu progreso y filtra por tema o examen completo.
                  </p>
                </div>
                {selectedTopicId && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-brand-blue dark:text-brand-cyan hover:underline font-bold"
                  >
                    Limpiar tema
                  </button>
                )}
              </div>

              {startError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle size={15} />
                  <span>{startError}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Todos" },
                  { id: "active", label: "En progreso" },
                  { id: "topic", label: "Por tema" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setExamFilter(filter.id as ExamFilter)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                      examFilter === filter.id
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-brand-blue/35 dark:border-brand-navy/30 dark:bg-[#0E1B2F] dark:text-slate-400"
                    }`}
                  >
                    <Filter size={13} />
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredExamCards.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl space-y-2">
                <HelpCircle size={40} className="mx-auto text-slate-300" />
                <h4 className="font-bold text-slate-700 dark:text-slate-350 text-sm">No hay exámenes disponibles</h4>
                <p className="text-xs text-slate-450 dark:text-slate-400">
                  No se encontraron exámenes para este filtro.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExamCards.map((exam) => {
                  const isExpanded = expandedExamId === exam.id;
                  
                  return (
                    <div
                      key={exam.id}
                      onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                      className="block p-6 bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl hover:shadow-md hover:border-brand-blue/35 transition-all text-left shadow-sm cursor-pointer select-none"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${
                                exam.type === "complete"
                                  ? "bg-brand-blue/10 text-brand-blue dark:text-brand-cyan"
                                  : "bg-amber-500/10 text-amber-500"
                              }`}>
                                {exam.type === "topic" ? "Por tema" : "Banco de preguntas"}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                                {exam.questionCount} preguntas
                              </span>
                            </div>
                            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                              {exam.title}
                            </h3>
                            <p className={`text-sm text-slate-500 dark:text-slate-400 ${isExpanded ? "" : "line-clamp-2"}`}>
                              {exam.description}
                            </p>
                          </div>
                          
                          <div className="flex shrink-0 items-start gap-3">
                            <CreatorBadge
                              name={exam.ownerName}
                              official={exam.ownerName === "Equipo ExamInA"}
                            />
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                alert("Pronto podrás reportar errores en exámenes del temario desde aquí.");
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-brand-navy/30 dark:bg-[#0E1B2F] dark:hover:border-red-900/40 dark:hover:bg-red-950/20"
                              title="Reportar un error"
                            >
                              <Flag size={15} />
                            </button>
                            <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-[#12243B] flex items-center justify-center text-slate-400">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>
                        </div>

                        {/* Contenido Expandido: Progreso, Tiempos y Acciones */}
                        {isExpanded && (
                          <div className="space-y-5 pt-3 border-t border-slate-100 dark:border-brand-navy/10 animate-fade-in">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500 dark:bg-[#12243B] dark:text-slate-400">
                                  Último intento
                                </div>
                                <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                                  exam.latestSession?.status === "COMPLETED"
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : exam.latestSession
                                    ? "bg-brand-blue/10 text-brand-blue dark:bg-brand-cyan/10 dark:text-brand-cyan"
                                    : "bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500"
                                }`}>
                                  {exam.latestStatusLabel}
                                </span>
                              </div>
                              {exam.latestSession?.status === "COMPLETED" && exam.latestMotivationPhrase && (
                                <div className={`rounded-xl px-3 py-2 text-xs font-black ${getScoreBadgeClasses(exam.latestAverageScoreNumber ?? 0)}`}>
                                  <span className="uppercase tracking-wide">
                                    Nota {exam.latestAverageScore}/10
                                  </span>
                                  <span className="mx-2 opacity-50">·</span>
                                  <span>{exam.latestMotivationPhrase}</span>
                                </div>
                              )}

                              {!exam.latestSession ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs font-bold text-slate-400 dark:border-brand-navy/30 dark:bg-[#12243B]/40">
                                  Todavía no hay intentos disponibles.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="rounded-xl bg-slate-50 dark:bg-[#12243B] p-3">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                      <BarChart3 size={13} />
                                      Progreso
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-white dark:bg-slate-900 overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan"
                                        style={{ width: `${exam.progress}%` }}
                                      />
                                    </div>
                                    <span className="mt-1 block text-xs font-black text-slate-700 dark:text-slate-200">
                                      {exam.progress}%
                                    </span>
                                  </div>
                                  <div className="rounded-xl bg-slate-50 dark:bg-[#12243B] p-3">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                      <Clock size={13} />
                                      Tiempo
                                    </div>
                                    <span className="mt-2 block text-xs font-black text-slate-700 dark:text-slate-200">
                                      {exam.elapsedTime}
                                    </span>
                                  </div>
                                  <div className="rounded-xl bg-slate-50 dark:bg-[#12243B] p-3">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                      <CalendarClock size={13} />
                                      {exam.latestSession.status === "COMPLETED" ? "Terminado" : "Última vez"}
                                    </div>
                                    <span className="mt-2 block text-xs font-black text-slate-700 dark:text-slate-200">
                                      {exam.lastOpened}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                             <div className="flex justify-end items-center gap-3 pt-2">
                              {isResetting === exam.id && (
                                <Loader2 size={16} className="animate-spin text-brand-blue mr-1" />
                              )}

                              {exam.latestSession?.status === "COMPLETED" ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenHistory({ id: exam.id, title: exam.title, questionIds: exam.questionIds });
                                    }}
                                    className="inline-flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition text-xs font-black cursor-pointer dark:bg-[#0E1B2F] dark:border-brand-navy/30 dark:text-slate-300 dark:hover:bg-[#12243B]"
                                  >
                                    <History size={13} />
                                    <span>Revisar intentos</span>
                                  </button>
                                  <button
                                    disabled={isResetting === exam.id || startingExamId === exam.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResetExam(exam);
                                    }}
                                    className="inline-flex justify-center items-center px-6 py-2.5 rounded-xl shadow-md text-xs font-black text-white bg-brand-blue hover:bg-brand-blue/90 transition cursor-pointer disabled:opacity-50"
                                  >
                                    {startingExamId === exam.id ? (
                                      <><Loader2 size={14} className="animate-spin mr-1.5" /> Creando...</>
                                    ) : (
                                      "Volver a intentarlo"
                                    )}
                                  </button>
                                </>
                              ) : exam.latestSession ? (
                                <>
                                  <button
                                    disabled={isResetting === exam.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResetExam(exam);
                                    }}
                                    className="inline-flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-white text-red-500 hover:bg-red-50 transition text-xs font-black cursor-pointer dark:bg-[#0E1B2F] dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
                                  >
                                    Reiniciar progreso
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenHistory({ id: exam.id, title: exam.title, questionIds: exam.questionIds });
                                    }}
                                    className="inline-flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition text-xs font-black cursor-pointer dark:bg-[#0E1B2F] dark:border-brand-navy/30 dark:text-slate-300 dark:hover:bg-[#12243B]"
                                  >
                                    <History size={13} />
                                    <span>Revisar intentos</span>
                                  </button>
                                  <button
                                    disabled={startingExamId === exam.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartTopicExam({
                                        id: exam.id,
                                        title: exam.title,
                                        questionIds: exam.questionIds
                                      });
                                    }}
                                    className="inline-flex justify-center items-center px-6 py-2.5 rounded-xl shadow-md text-xs font-black text-white bg-brand-blue hover:bg-brand-blue/90 transition cursor-pointer disabled:opacity-50"
                                  >
                                    {startingExamId === exam.id ? (
                                      <><Loader2 size={14} className="animate-spin mr-1.5" /> Abriendo...</>
                                    ) : (
                                      "Continuar examen"
                                    )}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    disabled={startingExamId === exam.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartTopicExam({
                                        id: exam.id,
                                        title: exam.title,
                                        questionIds: exam.questionIds
                                      });
                                    }}
                                    className="inline-flex justify-center items-center px-6 py-2.5 rounded-xl shadow-md text-xs font-black text-white bg-brand-blue hover:bg-brand-blue/90 transition cursor-pointer disabled:opacity-50"
                                  >
                                    {startingExamId === exam.id ? (
                                      <><Loader2 size={14} className="animate-spin mr-1.5" /> Creando...</>
                                    ) : (
                                      <><PlayCircle size={14} className="mr-1.5" /> Comenzar examen</>
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
      {/* Modal de Historial de Intentos */}
      {selectedExamForHistory && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/35 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in text-left">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy/15 pb-4 shrink-0">
              <div>
                <h3 className="text-base font-black text-brand-navy dark:text-white flex items-center gap-2">
                  <History className="text-brand-blue" size={20} />
                  <span>Historial de Intentos</span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 truncate max-w-md">
                  {selectedExamForHistory.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedExamForHistory(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Listado de Intentos */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                  <Loader2 size={32} className="animate-spin text-brand-blue" />
                  <p className="text-xs font-bold">Cargando historial...</p>
                </div>
              ) : historySessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <History size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-455">No hay intentos registrados todavía.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Completa un examen para ver tu historial aquí.</p>
                </div>
              ) : (
                historySessions.map((session: any) => {
                  const answeredCount = (session.questions || []).filter((q: any) => q.answered).length;
                  const totalQuestions = session.questions?.length ?? 0;
                  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
                  const formattedTime = formatTimeSeconds(session.totalTimeSeconds ?? 0);
                  const scores = (session.questions || [])
                    .filter((q: any) => q.score != null)
                    .map((q: any) => q.score);
                  const avgScore = scores.length > 0
                    ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)
                    : null;
                  const scoreColor = avgScore
                    ? parseFloat(avgScore) >= 7 ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : parseFloat(avgScore) >= 5 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-red-500/10 text-red-500"
                    : "bg-slate-500/10 text-slate-500";
                  const statusColor = session.status === "COMPLETED"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : session.status === "ABANDONED"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-brand-blue/10 text-brand-blue dark:text-brand-cyan";

                  return (
                    <article
                      key={session.id}
                      className="w-full p-4 bg-white dark:bg-[#0E1B2F] border border-slate-150 dark:border-brand-navy/20 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#12243B]/60 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                              {formatSessionHistoryLabel(session)}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor}`}>
                              {formatSessionStatus(session.status)}
                            </span>
                            {avgScore && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${scoreColor}`}>
                                Nota: {avgScore} / 10
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wide text-slate-400">
                              <span>Progreso</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {formattedTime}
                            </span>
                            <span>•</span>
                            <span>{answeredCount}/{totalQuestions} preguntas</span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExamForHistory(null);
                              navigate(`/exam-sessions/${session.id}`, { state: { review: session.status !== "IN_PROGRESS" } });
                            }}
                            className="inline-flex items-center justify-center rounded-xl bg-brand-blue px-3 py-2 text-[11px] font-black text-white shadow-sm shadow-brand-blue/15 transition hover:bg-brand-blue/90 cursor-pointer"
                          >
                            {session.status === "IN_PROGRESS" ? "Continuar" : "Revisar"}
                          </button>
                          <button
                            type="button"
                            disabled={deletingSessionId === session.id}
                            onClick={() => handleDeleteHistorySession(session.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-950/20 dark:hover:bg-red-950/40 cursor-pointer"
                            aria-label="Eliminar intento"
                          >
                            {deletingSessionId === session.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Pie del Modal */}
            <div className="border-t border-slate-100 dark:border-brand-navy/15 pt-4 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedExamForHistory(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
