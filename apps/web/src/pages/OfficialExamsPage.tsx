import {
  AlertCircle,
  ArrowLeft,
  BookOpenCheck,
  Clock3,
  FileText,
  Flag,
  Loader2,
  PlayCircle,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useOfficialExamsViewModel } from "../viewmodels/useOfficialExamsViewModel";
import { useSubjectsViewModel } from "../viewmodels/useSubjectsViewModel";
import { CreatorBadge } from "../shared/components/CreatorBadge";

export function OfficialExamsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { subjects } = useSubjectsViewModel();
  const subject = subjects.find((item) => item.id === subjectId);
  const {
    exams,
    isLoading,
    error,
    startError,
    startingExamId,
    handleRetry,
    handleStartExam
  } = useOfficialExamsViewModel(subjectId);

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/official-exams"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-brand-blue"
        >
          <ArrowLeft size={16} />
          <span>Volver a asignaturas</span>
        </Link>
      </div>

      <section className="rounded-3xl border border-brand-blue/10 bg-white p-6 shadow-xl shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/25 bg-brand-sky px-3 py-1 text-xs font-black uppercase tracking-wide text-brand-blue dark:bg-brand-cyan/10 dark:text-brand-cyan">
              <ShieldCheck size={14} />
              Exámenes oficiales ExamInA
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-brand-navy dark:text-white sm:text-4xl">
              {subject ? `Simulacros oficiales de ${subject.name}` : "Simulacros oficiales por asignatura"}
            </h1>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              Aquí aparecen los exámenes creados por el equipo de ExamInA para esta asignatura. Al iniciar uno, se crea tu propia sesión para guardar progreso, tiempo y correcciones sin modificar el examen oficial.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-64">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-brand-navy/25 dark:bg-brand-navy/20">
              <p className="text-2xl font-black text-brand-navy dark:text-white">{exams.length}</p>
              <p className="text-[11px] font-bold uppercase text-slate-400">Disponibles</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-brand-navy/25 dark:bg-brand-navy/20">
              <p className="text-2xl font-black text-brand-navy dark:text-white">90</p>
              <p className="text-[11px] font-bold uppercase text-slate-400">Minutos</p>
            </div>
          </div>
        </div>
      </section>

      {startError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle size={18} />
          <span>{startError}</span>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-16 dark:border-brand-navy/30 dark:bg-[#0E1B2F]">
          <Loader2 size={36} className="animate-spin text-brand-blue dark:text-brand-cyan" />
          <span className="mt-4 text-sm font-bold text-slate-400">Cargando exámenes oficiales...</span>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-900/30 dark:bg-red-950/20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle size={24} />
          </div>
          <h3 className="mt-4 text-base font-black text-red-600 dark:text-red-400">
            No se pudieron cargar los exámenes
          </h3>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{error}</p>
          <button
            type="button"
            onClick={() => handleRetry()}
            className="mt-5 inline-flex items-center justify-center rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100/50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <RefreshCw size={14} className="mr-2" />
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !error && exams.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center dark:border-brand-navy/40 dark:bg-[#0E1B2F]/70">
          <BookOpenCheck className="mx-auto h-10 w-10 text-brand-cyan" />
          <h3 className="mt-4 text-lg font-black text-brand-navy dark:text-white">
            Todavía no hay exámenes oficiales publicados
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Cuando el equipo publique simulacros, aparecerán aquí para todos los estudiantes.
          </p>
        </div>
      )}

      {!isLoading && !error && exams.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {exams.map((exam) => {
            const isStarting = startingExamId === exam.id;

            return (
              <article
                key={exam.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-brand-blue/5 transition hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-brand-blue/10 dark:border-brand-navy/30 dark:bg-[#0E1B2F]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-cyan text-white shadow-lg shadow-brand-blue/20">
                      <FileText size={25} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="mt-1 text-lg font-black leading-tight text-brand-navy dark:text-white">
                        {exam.title}
                      </h2>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-start gap-3">
                    <CreatorBadge
                      name={exam.owner.displayName || exam.owner.username || "Equipo ExamInA"}
                      username={exam.owner.username}
                      photoUrl={exam.owner.photoUrl}
                      official={(exam.owner.displayName || exam.owner.username || "Equipo ExamInA") === "Equipo ExamInA"}
                    />
                    <button
                      type="button"
                      onClick={() => alert("Pronto podrás reportar errores en exámenes oficiales desde aquí.")}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-brand-navy/30 dark:hover:border-red-900/40 dark:hover:bg-red-950/20"
                      title="Reportar un error"
                    >
                      <Flag size={16} />
                    </button>
                  </div>
                </div>

                {exam.description && (
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                    {exam.description}
                  </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-brand-navy/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <BookOpenCheck size={15} />
                      Preguntas
                    </div>
                    <p className="mt-1 text-xl font-black text-brand-navy dark:text-white">
                      {exam.questionCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-brand-navy/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock3 size={15} />
                      Duración
                    </div>
                    <p className="mt-1 text-xl font-black text-brand-navy dark:text-white">
                      90 min
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartExam(exam.id)}
                  disabled={isStarting}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-brand-blue px-5 py-3 text-sm font-black text-white shadow-lg shadow-brand-blue/20 transition hover:-translate-y-0.5 hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-cyan dark:text-brand-navy dark:hover:bg-white"
                >
                  {isStarting ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Preparando examen...
                    </>
                  ) : (
                    <>
                      <PlayCircle size={18} className="mr-2" />
                      Iniciar simulacro
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
