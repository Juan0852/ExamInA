import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useDashboardViewModel, DashboardStudyTimePoint } from "../viewmodels/useDashboardViewModel";
import { formatSignedSecondsSmart } from "../shared/utils/time-format";

import {
  Trophy,
  Flame,
  Clock,
  Brain,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Minus,
  X,
  FileText,
  CalendarClock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const GREETINGS = [
  "¡A por todas, {name}!",
  "¡Vamos a romperla hoy, {name}!",
  "Un día más cerca de tu meta, {name}.",
  "¡Concéntrate y vencerás, {name}!",
  "¿Listo para dar el máximo, {name}?",
  "El esfuerzo de hoy es tu éxito de mañana.",
  "¡A comernos el temario, {name}!",
  "¡Dale duro a esos apuntes, {name}!",
  "Tu futuro empieza hoy, {name}.",
  "¡No hay excusas que valgan, {name}!",
  "Haz que cada minuto cuente, {name}.",
  "¡A brillar en ese examen, {name}!",
  "Demuestra lo que vales, {name}.",
  "¡Con todo el power, {name}!",
  "Hoy es un buen día para aprender, {name}.",
  "¡A dar el 100%, {name}!",
  "La constancia es la clave, {name}.",
  "¡Rendirse no es opción, {name}!",
  "¡Vamos a por ese 10, {name}!",
  "Sigue adelante, {name}, lo estás haciendo genial.",
  "¡A sumar conocimientos, {name}!",
  "Tu mejor versión te espera, {name}.",
  "¡Actitud imparable, {name}!",
  "¡Cada repaso cuenta, {name}!",
  "Un pequeño paso hoy, un gran logro mañana.",
  "¡Tú puedes con esto y más, {name}!",
  "Apunta alto, {name}, el límite lo pones tú.",
  "¡Cree en ti, {name}, tienes talento!",
  "El conocimiento es poder, ¡a por él!",
  "¡Que nada te detenga, {name}!"
];

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

/**
 * DashboardPage: Panel de control principal del estudiante autenticado.
 * Muestra métricas de estudio y simulacros consumidos de forma dinámica del backend.
 */
export function DashboardPage() {
  const { user } = useAuthStore();
  const [isStreakLightboxOpen, setIsStreakLightboxOpen] = useState(false);
  const [isStudyTimeLightboxOpen, setIsStudyTimeLightboxOpen] = useState(false);
  const [studyTimeMode, setStudyTimeMode] = useState<"total" | "average">("total");

  const randomGreeting = useMemo(() => {
    const greetingTemplate = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    const name = user?.displayName?.split(" ")[0] || "Estudiante";
    return greetingTemplate.replace("{name}", name);
  }, [user?.displayName]);

  const {
    summary,
    streakMonth,
    isLoading,
    isError,
    error,
    refetch,
    getMappedStreakDays,
    formatSecondsToHours,
    formatSecondsToMinutes,
    formatSecondsSmart,
    formatRelativeDate,
    formatExamStatus,
    formatMonthLabel,
    monthCursor,
    hasMorePrevious,
    hasMoreNext,
    goToPreviousMonth,
    goToNextMonth
  } = useDashboardViewModel();

  const currentLevel = summary?.progress.level ?? 1;
  const currentXP = summary?.progress.experience ?? 0;
  const currentLevelBaseXP = 50 * (currentLevel - 1) * currentLevel;
  const nextLevelXP = 50 * currentLevel * (currentLevel + 1);
  const xpIntoCurrentLevel = Math.max(0, currentXP - currentLevelBaseXP);
  const xpRequiredForNextLevel = nextLevelXP - currentLevelBaseXP;
  const progressPercentage = Math.min(100, Math.round((xpIntoCurrentLevel / xpRequiredForNextLevel) * 100));
  const xpRemaining = nextLevelXP - currentXP;

  useEffect(() => {
    if (!isStreakLightboxOpen && !isStudyTimeLightboxOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsStreakLightboxOpen(false);
        setIsStudyTimeLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isStreakLightboxOpen, isStudyTimeLightboxOpen]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 size={44} className="animate-spin text-brand-blue dark:text-brand-cyan" />
        <span className="text-sm font-black text-slate-450 uppercase tracking-widest">
          Cargando tu progreso académico...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white dark:bg-[#0E1B2F] border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-650 mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="font-bold text-red-650 dark:text-red-400 text-base">Error al cargar estadísticas</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || "No se pudo conectar al servidor."}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-black transition cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Mensaje de Bienvenida */}
      <div className="bg-white dark:bg-[#0E1B2F] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-brand-navy/30 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight">
            {randomGreeting} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium mt-1">
            Continúa preparando tus exámenes PAU de Selectividad hoy.
          </p>
        </div>
        <div className="flex items-center space-x-4 bg-slate-50 dark:bg-brand-navy/20 px-4 py-3 rounded-xl border border-slate-100 dark:border-brand-navy/40 min-w-[200px]">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Trophy size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nivel {currentLevel}</div>
              <div className="text-[10px] font-bold text-orange-500">
                Faltan {xpRemaining} XP
              </div>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-400">
              <span>{currentLevelBaseXP}</span>
              <span>{currentXP} / {nextLevelXP}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.85fr] gap-6">
        <button
          type="button"
          onClick={() => setIsStreakLightboxOpen(true)}
          className="text-left bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 focus:outline-none focus:ring-4 focus:ring-orange-400/15 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-400">
                Racha de Estudio
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-150 shrink-0">
                  {summary?.streak.currentCount ?? 0} {summary?.streak.currentCount === 1 ? "día" : "días"}
                </span>
                <span className="text-[10px] font-bold text-orange-500 leading-tight">
                  {(summary?.streak.currentCount ?? 0) > 0 
                    ? "activa" 
                    : "Haz un examen por temas u oficial para comenzar tu racha de estudio"}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/20">
              <Flame size={22} />
            </div>
          </div>

          <div className="relative">
            <div className="relative grid grid-cols-5 gap-2">
              {getMappedStreakDays(summary?.streak.window).map((day, idx, arr) => (
                <div key={day.date} className="relative flex flex-col items-center gap-2">
                  {idx < arr.length - 1 && (
                    <div className={`absolute left-1/2 top-[20px] z-0 h-1 w-[calc(100%+0.5rem)] rounded-full ${
                      day.completed && arr[idx + 1].completed
                        ? "bg-orange-400"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`} />
                  )}
                  <div
                    className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-black transition-all ${
                      day.completed
                        ? "border-orange-400 bg-orange-50 text-orange-500 dark:bg-orange-950/20"
                        : day.status === "inactive"
                        ? "border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-600 opacity-50"
                        : day.status === "missed"
                        ? "border-red-400 bg-red-50 text-red-500 dark:bg-red-950/20"
                        : "border-slate-200 bg-white text-slate-350 dark:border-slate-700 dark:bg-[#0E1B2F] dark:text-slate-650"
                    } ${
                      day.isToday
                        ? "ring-4 ring-brand-cyan/20 shadow-lg shadow-brand-cyan/10"
                        : ""
                    }`}
                  >
                    {day.completed ? <CheckCircle2 size={18} /> : day.status === "inactive" ? <Minus size={17} /> : <XCircle size={17} />}
                  </div>
                  <div className="text-center">
                    <div className={`text-[11px] font-black ${day.isToday ? "text-brand-blue dark:text-brand-cyan" : "text-slate-500 dark:text-slate-400"}`}>
                      {day.label}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">
                      {day.completed ? "Hecho" : day.status === "inactive" ? "—" : day.status === "pending" ? "Pend." : "Corte"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-xs font-medium text-slate-500 dark:text-slate-400">
            Mantén tu racha estudiando todos los días sin falta para no perder el progreso.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setIsStudyTimeLightboxOpen(true)}
          className="text-left bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 focus:outline-none focus:ring-4 focus:ring-blue-400/15 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-400">
                Tiempo de Estudio
              </span>
              <div className="mt-1 text-2xl font-black text-slate-800 dark:text-slate-150">
                {formatSecondsSmart(summary?.studyTime.todayStudySeconds ?? 0)}
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Tiempo total del día.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
              <Clock size={22} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-[#12243B]">
              <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Hoy
              </div>
              <div className="mt-1 text-sm font-black text-brand-navy dark:text-white">
                {formatSecondsSmart(summary?.studyTime.todayStudySeconds ?? 0)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-[#12243B]">
              <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Total
              </div>
              <div className="mt-1 text-sm font-black text-brand-navy dark:text-white">
                {formatSecondsSmart(summary?.progress.totalStudyTimeSeconds ?? 0)}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Últimos exámenes */}
      <section className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-brand-navy dark:text-white tracking-tight">
              Últimos exámenes
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Continúa los exámenes abiertos o revisa los últimos intentos terminados.
            </p>
          </div>
          <Link
            to="/subjects"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue dark:text-brand-cyan hover:underline"
          >
            Ver asignaturas
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {summary?.recentExams && summary.recentExams.length > 0 ? (
            summary.recentExams.map((exam) => (
              <Link
                key={exam.id}
                to={`/exam-sessions/${exam.id}`}
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-blue/35 hover:bg-white hover:shadow-md dark:border-brand-navy/30 dark:bg-[#12243B] dark:hover:bg-[#0E1B2F]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue dark:text-brand-cyan">
                    <FileText size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                        exam.status === "COMPLETED"
                          ? "bg-green-500/10 text-green-500"
                          : exam.status === "ABANDONED"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-brand-blue/10 text-brand-blue dark:text-brand-cyan"
                      }`}>
                        {formatExamStatus(exam.status)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400">{exam.subjectName || "General"}</span>
                    </div>
                    <h3 className="mt-2 truncate text-sm font-black text-slate-800 transition-colors group-hover:text-brand-blue dark:text-slate-100 dark:group-hover:text-brand-cyan">
                      {exam.title}
                    </h3>
                    <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-3">
                      <div className="h-2 overflow-hidden rounded-full bg-white dark:bg-slate-900">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan"
                          style={{ width: `${exam.progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-slate-500 dark:text-slate-350">{exam.progressPercentage}%</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-450 dark:text-slate-450">
                        <Clock size={12} />
                        {formatSecondsSmart(exam.totalTimeSeconds)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      <CalendarClock size={12} />
                      Última vez: {formatRelativeDate(exam.lastOpenedAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-1 xl:col-span-2 py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-[#12243B]/30 rounded-xl border border-dashed border-slate-200 dark:border-brand-navy/15">
              <FileText size={32} className="mx-auto mb-2 opacity-50 text-brand-blue dark:text-brand-cyan" />
              <p className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-350">No hay exámenes recientes</p>
              <p className="text-[11px] text-slate-450 mt-1 font-medium">Contesta exámenes en el catálogo de asignaturas para ver tu historial aquí.</p>
            </div>
          )}
        </div>
      </section>

      {/* Enlaces de Acción Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm md:col-span-2">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center">
              <Brain size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Práctica de Examen Completo
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Pon a prueba tus conocimientos en un simulacro real contrarreloj. Los resultados históricos quedarán registrados en tu perfil para que repases tus errores.
            </p>
          </div>
          <div className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-brand-navy/20 inline-block px-3 py-1.5 rounded-lg border border-slate-100 dark:border-brand-navy/40 w-fit">
            Próximamente (Paso 9)
          </div>
        </div>
      </div>

      {isStreakLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="streak-lightbox-title"
          onClick={() => setIsStreakLightboxOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-brand-navy/30 dark:bg-[#0E1B2F] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-orange-500 dark:bg-orange-950/20">
                  <Flame size={14} />
                  Vista mensual
                </div>
                <h2 id="streak-lightbox-title" className="mt-3 text-2xl font-black text-brand-navy dark:text-white">
                  Racha de estudio
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Revisa los días completados, pendientes y los cortes de racha del mes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStreakLightboxOpen(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-brand-navy/30 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-white cursor-pointer"
                aria-label="Cerrar vista mensual de racha"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    disabled={!hasMorePrevious}
                    className="p-1 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="w-24 text-center">{formatMonthLabel(streakMonth?.month ?? monthCursor ?? undefined)}</span>
                  <button
                    type="button"
                    onClick={goToNextMonth}
                    disabled={!hasMoreNext}
                    className="p-1 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </h3>
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                    Hecho
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    Corte
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                    Inactivo
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-350" />
                    Pend.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="pb-1 text-center text-[11px] font-black text-slate-400">
                    {day}
                  </div>
                ))}
                {(() => {
                  if (!streakMonth || streakMonth.days.length === 0) return null;
                  const firstDayDate = new Date(streakMonth.days[0].date + "T00:00:00");
                  const dayOfWeek = firstDayDate.getDay();
                  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                  
                  return Array.from({ length: offset }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="border-transparent bg-transparent text-transparent" />
                  ));
                })()}
                {streakMonth?.days.map((day) => {
                  const dateObj = new Date(day.date + "T00:00:00");
                  const isToday = day.date === new Date().toISOString().split("T")[0];
                  
                  return (
                    <div
                      key={day.date}
                      className={`flex aspect-square items-center justify-center rounded-xl border text-sm font-black transition ${
                        day.status === "completed"
                          ? "border-orange-300 bg-orange-50 text-orange-500 dark:bg-orange-950/20"
                          : day.status === "inactive"
                          ? "border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-600 opacity-50"
                          : day.status === "missed"
                          ? "border-red-200 bg-red-50 text-red-500 dark:border-red-950/40 dark:bg-red-950/20"
                          : day.status === "pending"
                          ? "border-slate-200 bg-white text-slate-350 dark:border-slate-800 dark:bg-[#0E1B2F] dark:text-slate-650"
                          : "border-slate-200 bg-white text-slate-200 dark:border-slate-800 dark:bg-[#0E1B2F]/20 dark:text-slate-700"
                      } ${isToday ? "ring-4 ring-brand-cyan/20" : ""}`}
                    >
                      {dateObj.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isStudyTimeLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="study-time-lightbox-title"
          onClick={() => setIsStudyTimeLightboxOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-brand-navy/30 dark:bg-[#0E1B2F] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-brand-blue dark:bg-blue-950/20 dark:text-brand-cyan">
                  <Clock size={14} />
                  Tiempo semanal
                </div>
                <h2 id="study-time-lightbox-title" className="mt-3 text-2xl font-black text-brand-navy dark:text-white">
                  Tiempo de estudio
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Visualiza cuánto tiempo has dedicado cada día y detecta los días donde puedes reforzar tu rutina.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStudyTimeLightboxOpen(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-brand-navy/30 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-white cursor-pointer"
                aria-label="Cerrar gráfica de tiempo de estudio"
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const dailyPoints = summary?.studyTime.daily || [];
              const todaySecs = summary?.studyTime.todayStudySeconds ?? 0;
              const totalSecs = summary?.studyTime.weekStudySeconds ?? 0;
              const lifetimeSecs = summary?.progress.totalStudyTimeSeconds ?? 0;
              const activeDays = dailyPoints.filter((d) => d.studySeconds > 0).length;
              const avgWeekSecs = dailyPoints.length > 0 ? Math.round(totalSecs / dailyPoints.length) : 0;
              const avgActiveSecs = activeDays > 0 ? Math.round(totalSecs / activeDays) : 0;
              
              const bestPoint = dailyPoints.reduce<DashboardStudyTimePoint | null>((best, point) => {
                if (!best || point.studySeconds > best.studySeconds) return point;
                return best;
              }, null);
              
              const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
              const bestDayLabel = bestPoint && bestPoint.studySeconds > 0 
                ? dayNames[new Date(bestPoint.date + "T00:00:00").getDay()] 
                : "Ninguno";
                
              const maxStudySeconds = Math.max(60, ...dailyPoints.map((day) => day.studySeconds), avgWeekSecs);
              const modeIsTotal = studyTimeMode === "total";

              return (
                <>
                  <div className="mb-5 flex rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-brand-navy/30 dark:bg-[#07111F]">
                    {[
                      { id: "total", label: "Total" },
                      { id: "average", label: "Promedio" }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setStudyTimeMode(mode.id as "total" | "average")}
                        className={`h-10 flex-1 rounded-xl text-xs font-black transition cursor-pointer ${
                          studyTimeMode === mode.id
                            ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/15 dark:bg-brand-cyan dark:text-brand-navy"
                            : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-[#0E1B2F]"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
                      <span className="text-xs font-bold text-slate-400">
                        {modeIsTotal ? "Total de hoy" : "Promedio diario"}
                      </span>
                      <div className="mt-1 text-2xl font-black text-brand-navy dark:text-white">
                        {modeIsTotal ? formatSecondsSmart(todaySecs) : formatSecondsSmart(avgWeekSecs)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
                      <span className="text-xs font-bold text-slate-400">
                        {modeIsTotal ? "Total semanal" : "Promedio activo"}
                      </span>
                      <div className="mt-1 text-2xl font-black text-brand-navy dark:text-white">
                        {modeIsTotal ? formatSecondsSmart(totalSecs) : formatSecondsSmart(avgActiveSecs)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
                      <span className="text-xs font-bold text-slate-400">
                        {modeIsTotal ? "Total acumulado" : "Días con estudio"}
                      </span>
                      <div className="mt-1 text-2xl font-black text-brand-navy dark:text-white">
                        {modeIsTotal ? formatSecondsSmart(lifetimeSecs) : `${activeDays}/${dailyPoints.length || 7}`}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
                        {modeIsTotal ? "Tiempo por día" : "Comparación contra promedio diario"}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400">
                        {modeIsTotal ? "Semana actual" : `Promedio: ${formatSecondsSmart(avgWeekSecs)}`}
                      </span>
                    </div>

                    <div className="relative flex h-56 items-end gap-3 sm:gap-4">
                      {!modeIsTotal && (
                        <div
                          className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-brand-cyan/60"
                          style={{
                            bottom: `${Math.max(18, (avgWeekSecs / maxStudySeconds) * 176 + 34)}px`
                          }}
                        />
                      )}
                      {dailyPoints.map((day) => {
                        const height = (day.studySeconds / maxStudySeconds) * 100;
                        const diffSeconds = day.studySeconds - avgWeekSecs;
                        const dateObj = new Date(day.date + "T00:00:00");
                        const label = dayNames[dateObj.getDay()];

                        return (
                          <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                            <div className="flex h-44 w-full items-end rounded-xl bg-white px-1.5 py-2 dark:bg-[#0E1B2F]">
                              <div
                                className="w-full rounded-lg bg-gradient-to-t from-brand-blue to-brand-cyan shadow-lg shadow-brand-blue/10 transition-all"
                                style={{ height: `${Math.max(5, height)}%` }}
                                title={formatSecondsSmart(day.studySeconds)}
                              />
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] font-black text-slate-650 dark:text-slate-350">{label}</div>
                              <div className="text-[10px] font-bold text-slate-450">
                                {modeIsTotal ? formatSecondsSmart(day.studySeconds) : formatSignedSecondsSmart(diffSeconds)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
