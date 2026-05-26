import { useEffect } from "react";
import { useLoginViewModel } from "../../viewmodels/useLoginViewModel";
import { AlertCircle, Lock, Mail, PlayCircle, Loader2, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * LoginModal: Lightbox de inicio de sesión con efecto de desenfoque de fondo.
 * Consume useLoginViewModel siguiendo la arquitectura MVVM.
 */
export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin,
    handleMockLogin,
  } = useLoginViewModel();

  // Cerrar al pulsar la tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#07111F]/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
    >
      {/* Contenedor del Modal */}
      <div 
        className="bg-white dark:bg-[#0E1B2F] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200/60 dark:border-brand-navy/30 relative transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevenir que el click se propague al fondo y cierre el modal
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200/50 dark:hover:border-brand-navy/20 cursor-pointer"
          title="Cerrar modal"
        >
          <X size={18} />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img
              src="/brand/examina-logo-horizontal.png"
              alt="ExamInA"
              className="h-10 w-auto dark:hidden"
            />
            <img
              src="/brand/examina-logo-horizontal.png"
              alt="ExamInA"
              className="h-10 w-auto hidden dark:block invert brightness-200"
            />
          </div>
          <h2 className="text-2xl font-black text-brand-navy dark:text-white tracking-tight">
            Inicia sesión en tu cuenta
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            Estudia. Practica. Aprueba.
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-650 dark:text-red-400 text-xs font-semibold">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="modal-email" className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2">
              Correo electrónico
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                id="modal-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-brand-navy/30 rounded-xl bg-slate-55 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all"
                placeholder="ejemplo@correo.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="modal-password" className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-2">
              Contraseña
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                id="modal-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-brand-navy/30 rounded-xl bg-slate-55 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </div>
        </form>

        {/* Separador Modo Desarrollo */}
        <div className="mt-5">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-brand-navy/20"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modo Desarrollo</span>
            <div className="flex-grow border-t border-slate-200 dark:border-brand-navy/20"></div>
          </div>

          {/* Botón Mock Login */}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleMockLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-brand-cyan/35 dark:border-brand-cyan/20 rounded-xl shadow-sm text-sm font-bold text-brand-blue dark:text-brand-cyan bg-brand-sky/40 dark:bg-brand-navy/20 hover:bg-brand-sky/70 dark:hover:bg-brand-navy/40 transition-all cursor-pointer"
            >
              <PlayCircle size={16} className="mr-2" />
              <span>Prueba con Mock Login</span>
            </button>
            <p className="text-[9px] text-center text-slate-400 mt-2 font-medium">
              Acceso local directo sin requerir Firebase Auth.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
