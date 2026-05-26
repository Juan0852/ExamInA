import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginViewModel } from "../../viewmodels/useLoginViewModel";
import { useRegisterViewModel } from "../../viewmodels/useRegisterViewModel";
import { AlertCircle, Lock, Mail, Loader2, X, Info } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Icono SVG oficial de Google */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/**
 * LoginModal: Lightbox de inicio de sesión con efecto de desenfoque de fondo.
 * Muestra un vídeo en bucle a la izquierda (en desktop) y el formulario a la derecha.
 */
export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<"login" | "register">("login");
  const [showRequirements, setShowRequirements] = useState(false);

  const loginVm = useLoginViewModel();
  const registerVm = useRegisterViewModel();

  // Cerrar al pulsar Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const requirementsRef = useRef<HTMLDivElement>(null);

  // Cerrar requisitos al hacer clic fuera
  useEffect(() => {
    if (!showRequirements) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        requirementsRef.current &&
        !requirementsRef.current.contains(e.target as Node)
      ) {
        setShowRequirements(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showRequirements]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { count: 0, label: "", colorClass: "text-slate-400", bgClass: "bg-slate-200" };

    let count = 0;
    if (pass.length >= 8) count++;
    if (/[A-Z]/.test(pass)) count++;
    if (/[a-z]/.test(pass)) count++;
    if (/[0-9]/.test(pass)) count++;
    if (/[^A-Za-z0-9]/.test(pass)) count++;

    let label = "Muy débil";
    let colorClass = "text-red-500";
    let bgClass = "bg-red-500";

    if (count === 2) {
      label = "Débil";
      colorClass = "text-yellow-500";
      bgClass = "bg-yellow-500";
    } else if (count === 3 || count === 4) {
      label = "Media";
      colorClass = "text-orange-500";
      bgClass = "bg-orange-500";
    } else if (count === 5) {
      label = "Fuerte";
      colorClass = "text-green-500";
      bgClass = "bg-green-500";
    }

    return { count, label, colorClass, bgClass };
  };

  const strength = getPasswordStrength(registerVm.password);
  const isPasswordMismatch = registerVm.confirmPassword.length > 0 && registerVm.password !== registerVm.confirmPassword;

  if (!isOpen) return null;

  const error = view === "login" ? loginVm.error : registerVm.error;
  const isLoading = view === "login" ? loginVm.isLoading : registerVm.isLoading;

  return (
    <div
      className="fixed inset-0 bg-[#07111F]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
    >
      {/* Contenedor modal doble columna */}
      <div
        className="bg-white dark:bg-[#0E1B2F] rounded-3xl w-full max-w-6xl shadow-2xl border border-slate-200/60 dark:border-brand-navy/30 relative overflow-hidden flex flex-col md:grid md:grid-cols-[6fr_4fr]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-lg bg-white/80 dark:bg-[#0E1B2F]/80 backdrop-blur-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/40 dark:border-brand-navy/15 cursor-pointer"
          title="Cerrar"
        >
          <X size={18} />
        </button>

        {/* ── Columna izquierda: vídeo ── */}
        <div className="hidden md:block relative bg-black self-stretch">
          <video
            src="/brand/video-ia-examina.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-fill"
          />
        </div>

        {/* ── Columna derecha: formulario ── */}
        <div className="p-6 sm:p-10 flex flex-col justify-center bg-white dark:bg-[#0E1B2F] transition-colors duration-200">
          {/* Cabecera */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-black text-brand-navy dark:text-white tracking-tight">
              {view === "login" ? "Inicia sesión" : "Crea tu cuenta"}
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              🎓 Crea tus flashcards · 🏆 Gana medallas · 📚 Comparte exámenes
            </p>
          </div>

          {/* Error (sólo para login en la parte superior) */}
          {error && view === "login" && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-600 dark:text-red-400 text-xs font-semibold">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón Google */}
          <button
            type="button"
            disabled={isLoading}
            onClick={view === "login" ? loginVm.handleMockLogin : registerVm.handleGoogleRegister}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-200 dark:border-brand-navy/30 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#12243B] hover:bg-slate-50 dark:hover:bg-[#1a2f4a] transition-all cursor-pointer mb-5 disabled:opacity-50 shadow-sm"
          >
            <GoogleIcon />
            {view === "login" ? "Continuar con Google" : "Registrarse con Google"}
          </button>

          {/* Separador */}
          <div className="relative flex items-center mb-4">
            <div className="flex-grow border-t border-slate-200 dark:border-brand-navy/20" />
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              o con email
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-brand-navy/20" />
          </div>

          {/* Formulario */}
          {view === "login" ? (
            <form className="space-y-4" onSubmit={loginVm.handleLogin}>
              <div>
                <label htmlFor="modal-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    value={loginVm.email}
                    onChange={(e) => loginVm.setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-brand-navy/30 rounded-xl bg-slate-50 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all"
                    placeholder="ejemplo@correo.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="modal-password"
                    type="password"
                    required
                    value={loginVm.password}
                    onChange={(e) => loginVm.setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-brand-navy/30 rounded-xl bg-slate-50 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={registerVm.handleRegister}>
              <div>
                <label htmlFor="register-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={registerVm.email}
                    onChange={(e) => registerVm.setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-brand-navy/30 rounded-xl bg-slate-50 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all"
                    placeholder="ejemplo@correo.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="register-password"
                    type="password"
                    required
                    value={registerVm.password}
                    onChange={(e) => registerVm.setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-brand-navy/30 rounded-xl bg-slate-50 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                {/* Progress bar de fuerza de contraseña */}
                {registerVm.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-450 dark:text-slate-500">Fuerza de la contraseña:</span>
                      <span className={strength.colorClass}>{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-brand-navy/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.bgClass}`}
                        style={{ width: `${(strength.count / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {/* Botón interactivo de requisitos de la contraseña */}
                <div className="mt-2 relative" ref={requirementsRef}>
                  <button
                    type="button"
                    onClick={() => setShowRequirements(!showRequirements)}
                    className="inline-flex items-center space-x-1 text-[10px] font-bold text-brand-blue dark:text-brand-cyan hover:underline cursor-pointer focus:outline-none"
                  >
                    <Info size={12} className="flex-shrink-0" />
                    <span>{showRequirements ? "Ocultar requisitos de seguridad" : "¿Requisitos de contraseña?"}</span>
                  </button>

                  {/* Desplegable animado con info que se sobreposiciona (absolute) */}
                  {showRequirements && (
                    <div className="absolute left-0 top-full mt-1.5 z-30 w-full bg-white dark:bg-[#12243B] p-3.5 rounded-xl border border-slate-200 dark:border-brand-navy/35 text-[10px] space-y-2 text-slate-650 dark:text-slate-400 font-semibold shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">📏</span>
                        <span><strong>Longitud:</strong> Mínimo 8 caracteres</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">🔠</span>
                        <span><strong>Mayúsculas:</strong> Al menos una letra mayúscula (A-Z)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">🔡</span>
                        <span><strong>Minúsculas:</strong> Al menos una letra minúscula (a-z)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">🔢</span>
                        <span><strong>Números:</strong> Al menos un número (0-9)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">🔣</span>
                        <span><strong>Símbolos:</strong> Al menos un carácter especial (ej: @, $, !, %, *, ?, &)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Repetir contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="register-confirm-password"
                    type="password"
                    required
                    value={registerVm.confirmPassword}
                    onChange={(e) => registerVm.setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-xl bg-slate-50 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm transition-all ${
                      isPasswordMismatch
                        ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
                        : "border-slate-200 dark:border-brand-navy/30 focus:ring-brand-blue/30 focus:border-brand-blue"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                {isPasswordMismatch && (
                  <span className="text-[10px] font-bold text-red-500 mt-1 block">
                    las contraseñas no coinciden...
                  </span>
                )}
                {registerVm.error && registerVm.error !== "Las contraseñas no coinciden." && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-650 dark:text-red-400 text-[10px] font-bold">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{registerVm.error}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Toggle Login/Register */}
          <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            {view === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    registerVm.setError(null);
                    setView("register");
                  }}
                  className="font-bold text-brand-blue dark:text-brand-cyan hover:underline cursor-pointer"
                >
                  Créala aquí
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    loginVm.setError(null);
                    setView("login");
                  }}
                  className="font-bold text-brand-blue dark:text-brand-cyan hover:underline cursor-pointer"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
