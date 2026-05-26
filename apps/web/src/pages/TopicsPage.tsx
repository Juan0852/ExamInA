import { useParams, Link } from "react-router-dom";
import { useTopicsQuestionsViewModel } from "../viewmodels/useTopicsQuestionsViewModel";
import { ArrowLeft, BookOpen, AlertCircle, RefreshCw, Loader2, ListTodo, HelpCircle } from "lucide-react";

/**
 * TopicsPage: Vista que lista los temas de una asignatura y las preguntas disponibles.
 * Permite filtrar de forma interactiva las preguntas al pinchar sobre las tarjetas de temas.
 */
export function TopicsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
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

  return (
    <div className="space-y-8">
      {/* Botón de Retorno */}
      <div className="flex justify-between items-center">
        <Link
          to="/subjects"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      {/* Estado: Cargando */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={36} className="animate-spin text-brand-blue" />
          <span className="text-sm font-semibold text-slate-400">Cargando temas y preguntas...</span>
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
                <span>Temas de la Materia</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Pincha en un tema para filtrar las preguntas de la derecha.
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

          {/* Columna Derecha: Banco de Preguntas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-brand-navy/15 pb-4">
              <h2 className="text-lg font-black text-brand-navy dark:text-white tracking-tight flex items-center space-x-2">
                <ListTodo size={18} className="text-brand-blue" />
                <span>Banco de Preguntas</span>
              </h2>
              {selectedTopicId && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-brand-blue dark:text-brand-cyan hover:underline font-bold"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl space-y-2">
                <HelpCircle size={40} className="mx-auto text-slate-300" />
                <h4 className="font-bold text-slate-700 dark:text-slate-350 text-sm">No hay preguntas disponibles</h4>
                <p className="text-xs text-slate-450 dark:text-slate-400">
                  No se encontraron preguntas registradas en este bloque.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => {
                  // Estilos por dificultad
                  const diffColor = 
                    question.difficulty === "EASY" 
                      ? "bg-green-500/10 text-green-500" 
                      : question.difficulty === "MEDIUM" 
                        ? "bg-amber-500/10 text-amber-500" 
                        : "bg-red-500/10 text-red-500";
                  
                  return (
                    <Link
                      key={question.id}
                      to={`/questions/${question.id}`}
                      className="block p-6 bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl hover:shadow-md hover:border-brand-blue/35 transition-all text-left shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2.5">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${diffColor}`}>
                              {question.difficulty}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                              {question.type}
                            </span>
                            {(question.sourceYear || question.sourceExam) && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {question.sourceExam} ({question.sourceYear})
                              </span>
                            )}
                          </div>
                          
                          {/* Enunciado truncado */}
                          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium line-clamp-2">
                            {question.statement}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#12243B] flex items-center justify-center text-slate-400 group-hover:text-brand-blue flex-shrink-0">
                          &rarr;
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
