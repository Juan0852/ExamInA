import { useParams, Link } from "react-router-dom";
import { useQuestionViewModel } from "../viewmodels/useQuestionViewModel";
import { 
  ArrowLeft, Loader2, AlertCircle, RefreshCw, Send, CheckCircle, 
  XCircle, AlertTriangle, Key, ListChecks, HelpCircle, Brain 
} from "lucide-react";

/**
 * QuestionPage: Vista para visualizar una pregunta y redactar respuestas.
 * Consume useQuestionViewModel y muestra el desglose del feedback de IA.
 */
export function QuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const {
    question,
    isLoading,
    error,
    userAnswer,
    setUserAnswer,
    correction,
    isSubmitting,
    submitError,
    handleSubmitAnswer,
    handleReset,
    handleRetry,
  } = useQuestionViewModel(questionId);

  return (
    <div className="space-y-8">
      {/* Botón Retorno */}
      <div className="flex justify-between items-center">
        {question && (
          <Link
            to={`/subjects/${question.subjectId || "general"}/topics`}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Volver a Temas</span>
          </Link>
        )}
      </div>

      {/* Estado: Cargando */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={36} className="animate-spin text-brand-blue" />
          <span className="text-sm font-semibold text-slate-400">Cargando pregunta académica...</span>
        </div>
      )}

      {/* Estado: Error */}
      {error && (
        <div className="max-w-md mx-auto bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-650 dark:text-red-450 mx-auto">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-red-650 dark:text-red-400 text-base">Error al cargar pregunta</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          </div>
          <button
            onClick={() => handleRetry()}
            className="inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-900/40 rounded-xl text-sm font-bold text-red-650 dark:text-red-450 hover:bg-red-100/50 dark:hover:bg-red-950/50 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className="mr-2" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Contenido de la Pregunta */}
      {!isLoading && !error && question && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Pregunta y Formulario de Entrada */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Encabezado e info */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-brand-navy/15 pb-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  {question.type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-sky dark:bg-brand-navy/30 text-brand-blue dark:text-brand-cyan">
                  {question.difficulty}
                </span>
                {question.sourceExam && (
                  <span className="text-xs text-slate-400 font-medium">
                    {question.sourceExam} ({question.sourceYear})
                  </span>
                )}
              </div>

              {/* Enunciado */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <HelpCircle size={14} className="text-brand-blue" />
                  <span>Enunciado</span>
                </h3>
                <p className="text-base text-slate-800 dark:text-slate-200 font-semibold leading-relaxed whitespace-pre-line">
                  {question.statement}
                </p>
              </div>

              {/* Formulario de Respuesta */}
              {!correction && (
                <form onSubmit={handleSubmitAnswer} className="space-y-6 border-t border-slate-200 dark:border-brand-navy/15 pt-6">
                  <div className="space-y-2">
                    <label htmlFor="userAnswer" className="block text-sm font-bold text-slate-700 dark:text-slate-350">
                      Redacta tu solución o desarrollo
                    </label>
                    <textarea
                      id="userAnswer"
                      rows={8}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Escribe tu desarrollo paso a paso aquí..."
                      disabled={isSubmitting}
                      className="block w-full p-4 border border-slate-200 dark:border-brand-navy/30 rounded-xl bg-slate-55 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-650 dark:text-red-400 text-sm font-semibold">
                      <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        <span>Analizando respuesta con IA...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        <span>Enviar respuesta</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Input congelado en vista de corrección */}
              {correction && (
                <div className="space-y-3 border-t border-slate-200 dark:border-brand-navy/15 pt-6 text-left">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tu respuesta enviada</h4>
                  <div className="p-4 bg-slate-50 dark:bg-[#12243B] rounded-xl text-sm text-slate-650 dark:text-slate-350 border border-slate-100 dark:border-brand-navy/10 whitespace-pre-wrap">
                    {userAnswer}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Columna Derecha: Resultado de la Corrección de IA */}
          <div className="lg:col-span-5">
            {correction ? (
              <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl shadow-md overflow-hidden animate-slide-up">
                
                {/* Cabecera de Corrección */}
                <div className={`p-6 text-center text-white space-y-3 ${
                  correction.isCorrect 
                    ? "bg-gradient-to-r from-green-600 to-green-500" 
                    : "bg-gradient-to-r from-red-600 to-red-500"
                }`}>
                  <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {correction.isCorrect ? <CheckCircle size={28} /> : <XCircle size={28} />}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-lg">Evaluación de la IA</h3>
                    <p className="text-xs opacity-90">{correction.summary}</p>
                  </div>
                  <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full font-black text-xl tracking-tight">
                    {correction.score} / 10
                  </div>
                </div>

                {/* Cuerpo del feedback */}
                <div className="p-6 sm:p-8 space-y-6 text-left">
                  
                  {/* Comentarios */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retroalimentación</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                      {correction.feedback}
                    </p>
                  </div>

                  {/* Errores Detectados */}
                  {correction.detectedErrors.length > 0 && (
                    <div className="space-y-3 border-t border-slate-100 dark:border-brand-navy/10 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span>Errores detectados</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {correction.detectedErrors.map((err, i) => (
                          <li key={i} className="text-xs font-semibold text-red-650 dark:text-red-400 pl-4 relative before:absolute before:left-1 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-500">
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Palabras Clave Faltantes */}
                  {correction.missingKeywords.length > 0 && (
                    <div className="space-y-3 border-t border-slate-100 dark:border-brand-navy/10 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                        <Key size={14} className="text-amber-500" />
                        <span>Conceptos clave omitidos</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {correction.missingKeywords.map((kw, i) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-500">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sugerencias de mejora */}
                  {correction.suggestions.length > 0 && (
                    <div className="space-y-3 border-t border-slate-100 dark:border-brand-navy/10 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                        <ListChecks size={14} className="text-brand-blue" />
                        <span>Recomendaciones</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {correction.suggestions.map((sug, i) => (
                          <li key={i} className="text-xs font-semibold text-slate-600 dark:text-slate-400 pl-4 relative before:absolute before:left-1 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-brand-blue">
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="border-t border-slate-100 dark:border-brand-navy/10 pt-6">
                    <button
                      onClick={handleReset}
                      className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-200 dark:border-brand-navy/30 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Volver a intentar
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              // Caja de espera de resultados
              <div className="h-full border-2 border-dashed border-slate-200 dark:border-brand-navy/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center text-slate-400 min-h-[300px] bg-slate-50/50 dark:bg-brand-navy/5">
                <Brain size={48} className="text-slate-300 mb-4 animate-pulse" />
                <h4 className="font-bold text-sm text-slate-500 dark:text-slate-350">Esperando respuesta</h4>
                <p className="text-xs text-slate-450 dark:text-slate-400 max-w-[240px] mx-auto mt-1 leading-relaxed">
                  Redacta tu solución en el panel de la izquierda y haz clic en "Enviar respuesta" para recibir la evaluación de la IA.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
