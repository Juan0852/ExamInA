import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { BookOpen, Trophy, Flame, Clock, Brain, ArrowRight } from "lucide-react";

/**
 * DashboardPage: Panel de control principal del estudiante autenticado.
 * Muestra métricas de estudio mockeadas y accesos rápidos al catálogo de asignaturas.
 */
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  // Estadísticas mockeadas temporalmente hasta implementar el Paso 10
  const stats = [
    { label: "Racha de Estudio", value: "5 días", icon: Flame, color: "from-orange-400 to-red-500 shadow-orange-500/20" },
    { label: "Tiempo de Estudio", value: "3.5 hrs", icon: Clock, color: "from-blue-500 to-indigo-500 shadow-blue-500/20" },
    { label: "Preguntas Resueltas", value: "18 / 40", icon: Brain, color: "from-emerald-400 to-teal-500 shadow-emerald-500/20" },
  ];

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-6 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-450 dark:text-slate-400">
                  {stat.label}
                </span>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-150">
                  {stat.value}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr ${stat.color} text-white shadow-lg`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Enlaces de Acción Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card de Catálogo */}
        <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Banco de Asignaturas
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Explora las asignaturas PAU disponibles. Accede a los temas y practica resolviendo preguntas reales para recibir feedback instantáneo de la IA.
            </p>
          </div>
          <div className="mt-8">
            <Link
              to="/subjects"
              className="inline-flex items-center space-x-2 text-sm font-bold text-brand-blue dark:text-brand-cyan hover:underline group-hover:translate-x-1 transition-transform"
            >
              <span>Ir al Catálogo</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Card de Flashcards / Práctica Libre */}
        <div className="bg-white dark:bg-[#0E1B2F] border border-slate-200 dark:border-brand-navy/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
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
    </div>
  );
}
