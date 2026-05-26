import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { AppLayout } from "../shared/layouts/AppLayout";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { SubjectsPage } from "../pages/SubjectsPage";
import { TopicsPage } from "../pages/TopicsPage";
import { QuestionPage } from "../pages/QuestionPage";
import { OnboardingPage } from "../pages/OnboardingPage";
import { ProfilePage } from "../pages/ProfilePage";
import { DevPanel } from "../shared/components/DevPanel";

/**
 * Componente que redirige si el usuario ya está autenticado.
 * Evita que usuarios con sesión abierta accedan a la página de login.
 */
function GuestRoute({ children }: { children: React.JSX.Element }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

/**
 * AppRouter: Orquestador de la tabla de navegación de ExamInA.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Rutas Privadas / Autenticadas (envueltas en el AppLayout) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:subjectId/topics" element={<TopicsPage />} />
          <Route path="/questions/:questionId" element={<QuestionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback para cualquier ruta inexistente */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Panel de desarrollo flotante — sólo visible en modo DEV */}
      <DevPanel />
    </BrowserRouter>
  );
}
