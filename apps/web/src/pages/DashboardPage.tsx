import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { Trophy, Flame, Clock, Brain, ArrowRight, CheckCircle2, XCircle, X, FileText, CalendarClock } from "lucide-react";

const streakDays = [
  { label: "Lun", relative: "-2", completed: true, isToday: false },
  { label: "Mar", relative: "-1", completed: true, isToday: false },
  { label: "Hoy", relative: "0", completed: true, isToday: true },
  { label: "Jue", relative: "+1", completed: false, isToday: false },
  { label: "Vie", relative: "+2", completed: false, isToday: false },
];

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

const weeklyStudyTime = [
  { label: "Lun", minutes: 20 },
  { label: "Mar", minutes: 35 },
  { label: "Mié", minutes: 45 },
  { label: "Jue", minutes: 15 },
  { label: "Vie", minutes: 60 },
  { label: "Sáb", minutes: 25 },
  { label: "Dom", minutes: 10 },
];

const maxStudyMinutes = Math.max(...weeklyStudyTime.map((day) => day.minutes));

const recentExams = [
  { id: "exam-1", title: "Matemáticas II - Derivadas PAU 2023", subject: "Matemáticas II", status: "En progreso", progress: 68, lastOpened: "Hoy", time: "42 min", href: "/subjects" },
  { id: "exam-2", title: "Biología - Genética molecular", subject: "Biología", status: "Por continuar", progress: 35, lastOpened: "Ayer", time: "21 min", href: "/subjects" },
  { id: "exam-3", title: "Matemáticas II - Integrales completas", subject: "Matemáticas II", status: "Terminado", progress: 100, lastOpened: "Hace 2 días", time: "58 min", href: "/subjects" },
  { id: "exam-4", title: "Biología - Inmunología", subject: "Biología", status: "Sin corregir", progress: 82, lastOpened: "Hace 3 días", time: "47 min", href: "/subjects" },
  { id: "exam-5", title: "Matemáticas II - Álgebra lineal", subject: "Matemáticas II", status: "En progreso", progress: 50, lastOpened: "Hace 4 días", time: "33 min", href: "/subjects" },
  { id: "exam-6", title: "Biología - Metabolismo celular", subject: "Biología", status: "Por continuar", progress: 18, lastOpened: "Hace 5 días", time: "12 min", href: "/subjects" },
  { id: "exam-7", title: "Matemáticas II - Probabilidad", subject: "Matemáticas II", status: "Terminado", progress: 100, lastOpened: "Hace 1 semana", time: "51 min", href: "/subjects" },
  { id: "exam-8", title: "Biología - Evolución y biodiversidad", subject: "Biología", status: "En progreso", progress: 44, lastOpened: "Hace 1 semana", time: "29 min", href: "/subjects" },
  { id: "exam-9", title: "Matemáticas II - Geometría", subject: "Matemáticas II", status: "Por continuar", progress: 22, lastOpened: "Hace 8 días", time: "16 min", href: "/subjects" },
  { id: "exam-10", title: "Biología - Fisiología vegetal", subject: "Biología", status: "Terminado", progress: 100, lastOpened: "Hace 9 días", time: "46 min", href: "/subjects" },
];

function buildStreakMonth(today = new Date()) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const completedDays = new Set([1, 2, 3, 5, 6, 8, 9, 10, 12, 15, 16, 17, 18, 19, 20, 21, today.getDate()]);
  const missedDays = new Set([4, 7, 11, 13, 14]);

  return {
    label: `${monthNames[month]} ${year}`,
    days: [
      ...Array.from({ length: mondayBasedOffset }, (_, index) => ({
        key: `empty-${index}`,
        day: null,
        status: "empty" as const,
        isToday: false,
      })),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const isFuture = day > today.getDate();
        const isToday = day === today.getDate();
        const status = isFuture
          ? "future"
          : completedDays.has(day)
          ? "completed"
          : missedDays.has(day)
          ? "missed"
          : "empty";

        return {
          key: `day-${day}`,
          day,
          isToday,
          status,
        };
      }),
    ],
  };
}

/**
 * DashboardPage: Panel de control principal del estudiante autenticado.
 * Muestra métricas de estudio mockeadas y accesos rápidos al catálogo de asignaturas.
 */
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [isStreakLightboxOpen, setIsStreakLightboxOpen] = useState(false);
  const [isStudyTimeLightboxOpen, setIsStudyTimeLightboxOpen] = useState(false);
  const streakMonth = useMemo(() => buildStreakMonth(), []);

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

  // Estadísticas mockeadas temporalmente hasta implementar el Paso 10
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Mensaje de Bienvenida */}
      <div className="bg-white dark:bg-[#0E1B2F] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-brand-navy/30 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight">
            ¡Hola, {user?.displayName || "Estudiante"}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium mt-1">
            Continúa preparando tus exámenes PAU de Selectividad hoy.
          </p>
        </div>
        <div className="flex items-center space-x-4 bg-slate-50 dark:bg-brand-navy/20 px-4 py-3 rounded-xl border border-slate-100 dark:border-brand-navy/40">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nivel actual</div>
            <div className="text-sm font-black text-slate-800 dark:text-slate-200">Nivel 4 (1,250 XP)</div>
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
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-150">5 días</span>
                <span className="text-xs font-bold text-orange-500">activa</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/20">
              <Flame size={22} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[10%] right-[10%] top-[22px] h-1 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="absolute left-[10%] right-1/2 top-[22px] h-1 rounded-full bg-gradient-to-r from-orange-400 to-brand-cyan" />
            <div className="relative grid grid-cols-5 gap-2">
              {streakDays.map((day) => (
                <div key={day.relative} className="flex flex-col items-center gap-2">
                  <div
                    className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-black transition-all ${
                      day.completed
                        ? "border-orange-400 bg-orange-50 text-orange-500 dark:bg-orange-950/20"
                        : "border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-[#0E1B2F] dark:text-slate-600"
                    } ${
                      day.isToday
                        ? "ring-4 ring-brand-cyan/20 shadow-lg shadow-brand-cyan/10"
                        : ""
                    }`}
                  >
                    {day.completed ? <CheckCircle2 size={18} /> : <XCircle size={17} />}
                  </div>
                  <div className="text-center">
                    <div className={`text-[11px] font-black ${day.isToday ? "text-brand-blue dark:text-brand-cyan" : "text-slate-500 dark:text-slate-400"}`}>
                      {day.label}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">
                      {day.completed ? "Hecho" : day.relative.startsWith("+") ? "Pend." : "Corte"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-xs font-medium text-slate-500 dark:text-slate-400">
            La barra muestra dos días anteriores, el día actual y los próximos dos. Si fallas un día, el corte queda marcado en la línea.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setIsStudyTimeLightboxOpen(true)}
          className="text-left bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-6 flex items-center justify-between shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 focus:outline-none focus:ring-4 focus:ring-blue-400/15 cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-450 dark:text-slate-400">
              Tiempo de Estudio
            </span>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-150">
              3.5 hrs
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tiempo acumulado esta semana.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
            <Clock size={22} />
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
          {recentExams.map((exam) => (
            <Link
              key={exam.id}
              to={exam.href}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-blue/35 hover:bg-white hover:shadow-md dark:border-brand-navy/30 dark:bg-[#12243B] dark:hover:bg-[#0E1B2F]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue dark:text-brand-cyan">
                  <FileText size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                      exam.status === "Terminado"
                        ? "bg-green-500/10 text-green-500"
                        : exam.status === "Sin corregir"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-brand-blue/10 text-brand-blue dark:text-brand-cyan"
                    }`}>
                      {exam.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{exam.subject}</span>
                  </div>
                  <h3 className="mt-2 truncate text-sm font-black text-slate-800 transition-colors group-hover:text-brand-blue dark:text-slate-100 dark:group-hover:text-brand-cyan">
                    {exam.title}
                  </h3>
                  <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-3">
                    <div className="h-2 overflow-hidden rounded-full bg-white dark:bg-slate-900">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan"
                        style={{ width: `${exam.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-300">{exam.progress}%</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <Clock size={12} />
                      {exam.time}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <CalendarClock size={12} />
                    Última vez: {exam.lastOpened}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Enlaces de Acción Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card de Flashcards / Práctica Libre */}
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
          <div className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-brand-navy/20 inline-block px-3 py-1.5 rounded-lg border border-slate-100 dark:border-brand-navy/40">
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
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-brand-navy/30 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-white"
                aria-label="Cerrar vista mensual de racha"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  {streakMonth.label}
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
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
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
                {streakMonth.days.map((day) => (
                  <div
                    key={day.key}
                    className={`flex aspect-square items-center justify-center rounded-xl border text-sm font-black transition ${
                      day.status === "completed"
                        ? "border-orange-300 bg-orange-50 text-orange-500 dark:bg-orange-950/20"
                        : day.status === "missed"
                        ? "border-red-200 bg-red-50 text-red-500 dark:border-red-950/40 dark:bg-red-950/20"
                        : day.status === "future"
                        ? "border-slate-200 bg-white text-slate-300 dark:border-slate-800 dark:bg-[#0E1B2F] dark:text-slate-600"
                        : "border-transparent bg-transparent text-transparent"
                    } ${day.isToday ? "ring-4 ring-brand-cyan/20" : ""}`}
                  >
                    {day.day}
                  </div>
                ))}
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
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-brand-navy/30 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-white"
                aria-label="Cerrar gráfica de tiempo de estudio"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
                <span className="text-xs font-bold text-slate-400">Total semanal</span>
                <div className="mt-1 text-2xl font-black text-brand-navy dark:text-white">3.5 hrs</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
                <span className="text-xs font-bold text-slate-400">Mejor día</span>
                <div className="mt-1 text-2xl font-black text-brand-navy dark:text-white">Vie</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
                <span className="text-xs font-bold text-slate-400">Promedio</span>
                <div className="mt-1 text-2xl font-black text-brand-navy dark:text-white">30 min</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-brand-navy/30 dark:bg-[#07111F]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  Minutos por día
                </h3>
                <span className="text-[11px] font-bold text-slate-400">Semana actual</span>
              </div>

              <div className="flex h-56 items-end gap-3 sm:gap-4">
                {weeklyStudyTime.map((day) => {
                  const height = Math.max(8, (day.minutes / maxStudyMinutes) * 100);

                  return (
                    <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                      <div className="flex h-44 w-full items-end rounded-xl bg-white px-1.5 py-2 dark:bg-[#0E1B2F]">
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-brand-blue to-brand-cyan shadow-lg shadow-brand-blue/10 transition-all"
                          style={{ height: `${height}%` }}
                          title={`${day.minutes} minutos`}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-[11px] font-black text-slate-600 dark:text-slate-300">{day.label}</div>
                        <div className="text-[10px] font-bold text-slate-400">{day.minutes}m</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
