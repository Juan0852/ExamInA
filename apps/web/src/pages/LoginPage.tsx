import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * LoginPage: Vista de inicio de sesión de la aplicación.
 * Redirige a la página principal con el parámetro de consulta ?login=true
 * para abrir el login en un modal con desenfoque de fondo.
 */
export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/?login=true", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111F] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-brand-blue border-t-transparent animate-spin mx-auto" />
        <span className="text-sm font-semibold text-slate-400">Redirigiendo a inicio de sesión...</span>
      </div>
    </div>
  );
}
