import { useLoginViewModel } from "../viewmodels/useLoginViewModel";
import { Link } from "react-router-dom";
import { AlertCircle, Lock, Mail, PlayCircle, Loader2 } from "lucide-react";

/**
 * LoginPage: Vista de inicio de sesión de la aplicación.
 * Consume useLoginViewModel siguiendo la arquitectura MVVM.
 */
export function LoginPage() {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111F] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      
      {/* Brillos decorativos */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-blue/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-brand-cyan/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center mb-6">
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
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Inicia sesión en tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          O vuelve a la <Link to="/" className="text-brand-blue dark:text-brand-cyan hover:underline">página de inicio</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white dark:bg-[#0E1B2F] py-8 px-4 shadow-md shadow-slate-200/50 dark:shadow-none rounded-2xl sm:px-10 border border-slate-200 dark:border-brand-navy/30">
          
          {/* Alerta de Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-650 dark:text-red-400 text-sm font-semibold">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-brand-navy/30 rounded-xl bg-slate-55 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all"
                  placeholder="ejemplo@correo.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-brand-navy/30 rounded-xl bg-slate-55 dark:bg-[#12243B] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-sm transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 transition-all cursor-pointer"
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

          {/* Separador */}
          <div className="mt-6">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-brand-navy/20"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400">Modo Desarrollo</span>
              <div className="flex-grow border-t border-slate-200 dark:border-brand-navy/20"></div>
            </div>

            {/* Mock Login Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleMockLogin}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-brand-cyan/30 dark:border-brand-cyan/20 rounded-xl shadow-sm text-sm font-bold text-brand-blue dark:text-brand-cyan bg-brand-sky/30 dark:bg-brand-navy/20 hover:bg-brand-sky/60 dark:hover:bg-brand-navy/40 transition-all cursor-pointer"
              >
                <PlayCircle size={18} className="mr-2" />
                <span>Prueba con Mock Login</span>
              </button>
              <p className="text-[10px] text-center text-slate-450 dark:text-slate-400 mt-2 font-medium">
                Acceso local directo sin requerir Firebase Auth.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
