import { Link } from "react-router-dom";
import { useSubjectsViewModel } from "../viewmodels/useSubjectsViewModel";
import { Book, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";

// Helper para comprobar si una asignatura está activa (Sólo Matemáticas y Biología)
const isSubjectEnabled = (name: string): boolean => {
  const normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalized.includes("matematica") || normalized.includes("biologia");
};

// Helper para obtener el icono SVG correspondiente
const getSubjectIcon = (name: string): string => {
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (slug.includes("matemat")) return "/brand/subjects/matematicas.svg";
  if (slug.includes("biolog")) return "/brand/subjects/biologia.svg";
  if (slug.includes("fisic")) return "/brand/subjects/fisica.svg";
  if (slug.includes("quimic")) return "/brand/subjects/quimica.svg";
  if (slug.includes("lengua") || slug.includes("literatura")) return "/brand/subjects/lengua.svg";
  if (slug.includes("ingles")) return "/brand/subjects/ingles.svg";
  if (slug.includes("filosof")) return "/brand/subjects/filosofia.svg";
  if (slug.includes("geograf")) return "/brand/subjects/geografia.svg";
  if (slug.includes("latin")) return "/brand/subjects/latin.svg";
  if (slug.includes("dibujo")) return "/brand/subjects/dibujo-tecnico.svg";
  if (slug.includes("economia")) return "/brand/subjects/economia.svg";
  if (slug.includes("tecnolo") || slug.includes("ingenier")) return "/brand/subjects/tecnologia.svg";
  if (slug.includes("histor")) return "/brand/subjects/historia.svg";
  return "/brand/subjects/matematicas.svg"; // fallback
};

/**
 * SubjectsPage: Vista de catálogo de asignaturas.
 * Consume useSubjectsViewModel enlazando datos a la interfaz.
 */
type SubjectsPageProps = {
  mode?: "syllabus" | "official-exams";
};

export function SubjectsPage({ mode = "syllabus" }: SubjectsPageProps) {
  const { subjects, isLoading, error, handleRetry } = useSubjectsViewModel();
  const isOfficialExamMode = mode === "official-exams";

  return (
    <div className="space-y-8">
      {/* Cabecera de Página */}
      <div className="text-left">
        <h1 className="text-3xl font-black text-brand-navy dark:text-white tracking-tight">
          {isOfficialExamMode ? "Exámenes oficiales por asignatura" : "Temario PAU / Selectividad"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium mt-1">
          {isOfficialExamMode
            ? "Selecciona una asignatura para ver los simulacros oficiales disponibles."
            : "Selecciona una asignatura para explorar sus temas y comenzar a practicar."}
        </p>
      </div>

      {/* Estado: Cargando */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 size={36} className="animate-spin text-brand-blue" />
          <span className="text-sm font-semibold text-slate-400">Cargando catálogo de asignaturas...</span>
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
            onClick={() => handleRetry()}
            className="inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-900/40 rounded-xl text-sm font-bold text-red-650 dark:text-red-450 hover:bg-red-100/50 dark:hover:bg-red-950/50 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className="mr-2" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Estado: Lista Vacía */}
      {!isLoading && !error && subjects.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-brand-navy/20 rounded-2xl">
          <Book size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No hay asignaturas disponibles</h3>
          <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">El catálogo está vacío en este momento.</p>
        </div>
      )}

      {/* Grid de Asignaturas */}
      {!isLoading && !error && subjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const enabled = isSubjectEnabled(subject.name);
            return enabled ? (
              <Link
                key={subject.id}
                to={isOfficialExamMode ? `/official-exams/${subject.id}` : `/subjects/${subject.id}/topics`}
                className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-6 hover:shadow-lg hover:border-brand-blue/35 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-4">
                  <div className="h-20 w-20 min-w-20 max-w-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 flex-none bg-brand-sky dark:bg-brand-navy/30">
                    <img src={getSubjectIcon(subject.name)} alt={subject.name} className="h-16 w-16 min-w-16 max-w-16 object-contain flex-shrink-0" />
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 group-hover:text-brand-blue dark:group-hover:text-brand-cyan transition-colors">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed font-medium">
                      {subject.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-end mt-8 text-brand-blue dark:text-brand-cyan text-sm font-bold group-hover:translate-x-1 transition-transform">
                  <span>{isOfficialExamMode ? "Ver exámenes oficiales" : "Explorar temario"}</span>
                  <ChevronRight size={16} className="ml-1" />
                </div>
              </Link>
            ) : (
              <div
                key={subject.id}
                className="bg-white/80 dark:bg-[#0E1B2F]/80 border border-slate-200/60 dark:border-brand-navy/20 rounded-2xl p-6 opacity-60 cursor-not-allowed flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-20 w-20 min-w-20 max-w-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 flex-none opacity-60 bg-slate-100 dark:bg-[#1C2C42]/50">
                      <img src={getSubjectIcon(subject.name)} alt={subject.name} className="h-16 w-16 min-w-16 max-w-16 object-contain flex-shrink-0" />
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#12243B] border border-slate-200/40 dark:border-brand-navy/30 rounded-md">
                      Próximamente
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-400 dark:text-slate-500">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-xs text-slate-450/80 dark:text-slate-500 leading-relaxed font-medium">
                      {subject.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-end mt-8 text-slate-400 dark:text-slate-500 text-sm font-bold">
                  <span>Próximamente</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
