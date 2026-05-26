import { lazy, Suspense, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Award,
  Brain,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  MessageCircle,
  PlayCircle,
  Route,
  Share2,
  Sparkles,
  Target,
  UploadCloud,
  Users
} from "lucide-react";
import { LoginModal } from "../shared/components/LoginModal";

const LogoScene3D = lazy(() =>
  import("../shared/components/LogoScene3D").then((module) => ({
    default: module.LogoScene3D
  }))
);

/**
 * LandingPage: Página de bienvenida pública de ExamInA.
 * Diseñada con colores de marca profundos y efectos visuales de alta gama.
 */
export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("login") === "true") {
      setIsLoginOpen(true);
    }
  }, [searchParams]);

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111F] text-slate-800 dark:text-slate-200 transition-colors duration-200">
      
      {/* Header flotante */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#07111F]/80 backdrop-blur-md border-b border-slate-200 dark:border-brand-navy/20">
        <div className="max-w-7xl mx-auto px-4 h-32 flex justify-between items-center sm:px-6 lg:px-8">
          <div className="flex items-center">
            <img
              src="/brand/examina-logo-transparent-cropped.png"
              alt="ExamInA"
              className="h-16 w-auto sm:h-28"
            />
          </div>
          <div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex min-w-[116px] items-center justify-center text-center px-4 py-2 border border-slate-300 dark:border-brand-navy/50 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 sm:min-w-0 cursor-pointer"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-brand-sky dark:bg-brand-navy/40 border border-brand-blue/20 dark:border-brand-blue/30 rounded-full text-xs font-bold text-brand-blue dark:text-brand-cyan mb-8 animate-pulse">
            <Brain size={14} />
            <span>Preparación PAU / Selectividad Inteligente</span>
          </div>

          {/* Título Principal */}
          <h1 className="relative z-10 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-brand-navy dark:text-white leading-[1.1] mb-6">
            <span className="hero-word-rotator mb-1">
              <span>Estudia</span>
              <span>Practica</span>
              <span>Aprueba</span>
            </span>
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
              con Inteligencia Artificial.
            </span>
          </h1>

          {/* Descripción corta */}
          <p className="relative z-10 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">
            ExamInA te ayuda a dominar tus exámenes de Matemáticas, Biología y Física evaluando no solo el resultado final, sino también tu procedimiento paso a paso.
          </p>

          {/* CTAs */}
          <div className="relative z-20 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Comenzar a estudiar</span>
              <ChevronRight size={18} className="ml-1" />
            </button>
            <a
              href="#caracteristicas"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-brand-navy/40 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold rounded-xl transition-all"
            >
              Saber más
            </a>
          </div>

          <div className="relative z-10 mt-10 flex justify-center sm:mt-12">
            <Suspense fallback={<div className="h-[260px] w-full max-w-[430px] sm:h-[330px] lg:h-[390px]" />}>
              <LogoScene3D
                className="relative h-[280px] w-full max-w-[520px] sm:h-[360px] lg:h-[430px] lg:max-w-[620px]"
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="py-20 bg-white dark:bg-[#0E1B2F] border-y border-slate-200 dark:border-brand-navy/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-brand-navy dark:text-white tracking-tight mb-4">
              ¿Por qué preparar tus exámenes con ExamInA?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Una suite de herramientas diseñadas para estudiar de forma adaptada y guiada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 dark:bg-brand-navy/10 border border-slate-200 dark:border-brand-navy/20 p-8 rounded-2xl hover:shadow-lg transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-6">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                Preguntas Reales PAU
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Acceso a un banco de preguntas clasificadas por asignatura, tema y nivel de dificultad extraídas de exámenes oficiales.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 dark:bg-brand-navy/10 border border-slate-200 dark:border-brand-navy/20 p-8 rounded-2xl hover:shadow-lg transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center mb-6">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                Feedback por Procedimiento
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Nuestra IA evalúa tus pasos de cálculo de forma aislada, detectando errores de signos o conclusiones inválidas al momento.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 dark:bg-brand-navy/10 border border-slate-200 dark:border-brand-navy/20 p-8 rounded-2xl hover:shadow-lg transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                Gamificación Inteligente
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Gana puntos de experiencia, sube de nivel y desbloquea logros por tu regularidad de estudio diario.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50 dark:bg-brand-navy/10 border border-slate-200 dark:border-brand-navy/20 p-8 rounded-2xl hover:shadow-lg transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                Comunidad de Estudio
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Publica dudas, conecta con otros estudiantes y comparte exámenes o recursos útiles para preparar mejor cada materia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-[#0E1B2F] border-t border-slate-200 dark:border-brand-navy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-brand-navy/30 border border-slate-200 dark:border-brand-blue/20 rounded-lg text-xs font-bold uppercase tracking-wide text-brand-blue dark:text-brand-cyan mb-5">
                <PlayCircle size={15} />
                <span>Cómo funciona</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight mb-5">
                De una pregunta difícil a una ruta clara de mejora.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                Este breve video te mostrará cómo ExamInA te acompaña al estudiar: eliges una materia, practicas con preguntas oficiales o compartidas por la comunidad, subes tu procedimiento y recibes una corrección clara para saber qué mejorar en tu siguiente intento.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-white dark:bg-brand-navy/10 p-4">
                  <Target size={20} className="text-brand-blue mb-3" />
                  <p className="text-sm font-bold text-brand-navy dark:text-white">Elige tu objetivo</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-white dark:bg-brand-navy/10 p-4">
                  <UploadCloud size={20} className="text-brand-cyan mb-3" />
                  <p className="text-sm font-bold text-brand-navy dark:text-white">Sube tu desarrollo</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-white dark:bg-brand-navy/10 p-4">
                  <Route size={20} className="text-amber-500 mb-3" />
                  <p className="text-sm font-bold text-brand-navy dark:text-white">Recibe una ruta</p>
                </div>
              </div>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 dark:border-brand-blue/20 bg-brand-navy shadow-2xl shadow-brand-blue/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.32),transparent_34%),linear-gradient(135deg,rgba(8,121,242,0.28),rgba(7,17,31,0.94))]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/12 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/18"
                  aria-label="Reproducir video de ExamInA"
                >
                  <PlayCircle size={44} />
                </button>
              </div>
              <div className="absolute left-6 right-6 bottom-6">
                <p className="text-sm font-bold text-white">Video: cómo funciona ExamInA</p>
                <p className="text-xs text-white/70">Práctica, corrección inteligente, progreso y comunidad en un solo recorrido.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-[#0E1B2F] border-y border-slate-200 dark:border-brand-navy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-sky dark:bg-brand-navy/40 border border-brand-blue/20 dark:border-brand-blue/30 rounded-lg text-xs font-bold uppercase tracking-wide text-brand-blue dark:text-brand-cyan mb-5">
              <Sparkles size={15} />
              <span>Approach IA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight mb-5">
              No es solo decirte si está bien o mal. Es entender cómo estás pensando.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              ExamInA está pensado para estudiar como se corrige un examen real: mirando el procedimiento, detectando el punto exacto donde te desvías y transformando ese error en una acción concreta de estudio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-slate-50 dark:bg-brand-navy/10 p-6 flex flex-col items-center text-center">
              <div className="h-11 w-11 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-5">
                <Brain size={22} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">Corrección por razonamiento</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                La IA revisa pasos, fórmulas, unidades, conclusiones y coherencia. El objetivo es encontrar el fallo real, no castigar una respuesta final aislada.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-slate-50 dark:bg-brand-navy/10 p-6 flex flex-col items-center text-center">
              <div className="h-11 w-11 rounded-lg bg-brand-cyan/10 text-brand-cyan flex items-center justify-center mb-5">
                <Target size={22} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">Diagnóstico personalizado</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Cada intento alimenta tu perfil de progreso para mostrar materias, temas y tipos de ejercicios donde necesitas insistir antes del examen.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-slate-50 dark:bg-brand-navy/10 p-6 flex flex-col items-center text-center">
              <div className="h-11 w-11 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5">
                <Route size={22} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">Ruta de estudio accionable</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                En vez de dejarte con una nota, ExamInA convierte tus errores en próximos pasos: qué practicar, qué repasar y cuándo volver a intentarlo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#07111F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-brand-navy/30 border border-slate-200 dark:border-brand-blue/20 rounded-lg text-xs font-bold uppercase tracking-wide text-brand-blue dark:text-brand-cyan mb-5">
                <Users size={15} />
                <span>Comunidad ExamInA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight mb-5">
                Estudiar solo está bien. Estudiar con una comunidad preparada es mejor.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                Además de nuestro banco de exámenes oficiales, ExamInA te permite aprender con recursos compartidos por otros estudiantes: publicaciones, dudas, soluciones, exámenes comentados y materiales que ayudan a entender cómo se está preparando la comunidad.
              </p>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                La idea no es solo consumir ejercicios, sino construir un entorno donde puedas preguntar, comparar enfoques, guardar buenos recursos y encontrar personas que estén cursando las mismas materias que tú.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-white dark:bg-brand-navy/10 p-6 flex flex-col items-center text-center">
                <MessageCircle size={24} className="text-brand-blue mb-4" />
                <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-2">Posts y dudas</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Comparte preguntas, avances o bloqueos para recibir orientación y descubrir cómo otros resuelven el mismo tipo de problema.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-white dark:bg-brand-navy/10 p-6 flex flex-col items-center text-center">
                <Users size={24} className="text-emerald-500 mb-4" />
                <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-2">Conecta con estudiantes</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Encuentra personas con materias, objetivos y ritmo de estudio similares para no preparar tus exámenes a ciegas.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-white dark:bg-brand-navy/10 p-6 flex flex-col items-center text-center">
                <FileText size={24} className="text-amber-500 mb-4" />
                <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-2">Exámenes oficiales</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Practica con preguntas organizadas por asignatura, tema y dificultad para entrenar con estructura desde el primer día.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-brand-navy/20 bg-white dark:bg-brand-navy/10 p-6 flex flex-col items-center text-center">
                <Share2 size={24} className="text-brand-cyan mb-4" />
                <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-2">Exámenes compartidos</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Sube, guarda y reutiliza exámenes de la comunidad para ampliar tu práctica con material real y diverso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#07111F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-brand-blue dark:text-brand-cyan font-bold text-sm mb-5">
            <CheckCircle2 size={18} />
            <span>Preparación con estructura, práctica y feedback real</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight mb-5">
            Construye seguridad antes del examen, no después de equivocarte en él.
          </h2>
          <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
            Organiza tus materias, continúa tests pendientes, sube soluciones, recibe correcciones y mide tu progreso con una experiencia diseñada para estudiar todos los días sin perder el rumbo.
          </p>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-lg shadow-lg shadow-brand-blue/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Entrar a ExamInA</span>
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </section>

      {/* Lightbox / Modal de Login */}
      <LoginModal isOpen={isLoginOpen} onClose={handleCloseLogin} />
    </div>
  );
}
