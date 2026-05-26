import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTopicsQuestionsViewModel } from "../viewmodels/useTopicsQuestionsViewModel";
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
  Filter
} from "lucide-react";

type ExamFilter = "all" | "active" | "complete" | "topic";

/**
 * TopicsPage: Espacio de trabajo de una asignatura.
 * Muestra exámenes disponibles, progreso de intentos y filtros por tema.
 */
export function TopicsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [examFilter, setExamFilter] = useState<ExamFilter>("all");
  const {
    topics,
    questions,
    selectedTopicId,
    isLoading,
    error,
    handleToggleTopicFilter,
    handleClearFilters,
    handleRetry,
  } = useTopicsQuestionsViewModel(subjectId);

  const examCards = useMemo(() => {
    const topicNameById = new Map(topics.map((topic) => [topic.id, topic.name]));

    return questions.map((question, index) => {
      const topicName = question.topicId ? topicNameById.get(question.topicId) : null;
      const isCompleteExam = !question.topicId || index % 4 === 0;
      const progress = index % 3 === 0 ? 64 : index % 3 === 1 ? 28 : 0;

      return {
        id: question.id,
        title: isCompleteExam
          ? question.sourceExam || `Examen completo ${question.sourceYear || "PAU"}`
          : `Bloque de ${topicName || "tema específico"}`,
        subtitle: isCompleteExam
          ? "Examen completo"
          : topicName || "Tema de la materia",
        type: isCompleteExam ? "complete" : "topic",
        progress,
        elapsedTime: progress > 0 ? `${18 + index * 7} min` : "Sin iniciar",
        lastOpened: progress > 0 ? index % 2 === 0 ? "Hoy" : "Ayer" : "Nunca",
        questionCount: Math.max(1, Math.min(6, questions.length - index)),
        question,
      };
    });
  }, [questions, topics]);

  const filteredExamCards = examCards.filter((exam) => {
    if (examFilter === "active") return exam.progress > 0 && exam.progress < 100;
    if (examFilter === "complete") return exam.type === "complete";
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

              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Todos" },
                  { id: "active", label: "En progreso" },
                  { id: "complete", label: "Exámenes completos" },
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
                  return (
                    <Link
                      key={exam.id}
                      to={`/questions/${exam.question.id}`}
                      className="block p-6 bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl hover:shadow-md hover:border-brand-blue/35 transition-all text-left shadow-sm"
                    >
                      <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${
                                exam.type === "complete"
                                  ? "bg-brand-blue/10 text-brand-blue dark:text-brand-cyan"
                                  : "bg-amber-500/10 text-amber-500"
                              }`}>
                                {exam.subtitle}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                                {exam.questionCount} preguntas
                              </span>
                            </div>
                            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                              {exam.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                              {exam.question.statement}
                            </p>
                          </div>
                          <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-[#12243B] flex items-center justify-center text-slate-400 flex-shrink-0">
                            &rarr;
                          </div>
                        </div>

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
                              Última vez
                            </div>
                            <span className="mt-2 block text-xs font-black text-slate-700 dark:text-slate-200">
                              {exam.lastOpened}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
