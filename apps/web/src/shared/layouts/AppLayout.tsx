import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { Sidebar } from "../components/Sidebar";

/**
 * AppLayout: Layout de protección de rutas privadas.
 * Verifica el estado de autenticación de Zustand. Si no está logueado, redirige a `/login`.
 * Si está logueado, dibuja el Sidebar lateral y el contenedor principal con Outlet.
 */
export function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirección directa al login en caso de no contar con sesión válida
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#07111F] text-slate-800 dark:text-slate-200 transition-colors duration-200">
      {/* Sidebar Lateral responsivo */}
      <Sidebar />

      {/* Área del contenido principal con espaciado adaptativo */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-72 pt-16 md:pt-0">
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        {/* Footer minimalista */}
        <footer className="border-t border-slate-200/50 dark:border-brand-navy/15 py-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/30 dark:bg-[#0E1B2F]/10">
          &copy; {new Date().getFullYear()} ExamInA - Estudia. Practica. Aprueba.
        </footer>
      </div>
    </div>
  );
}
