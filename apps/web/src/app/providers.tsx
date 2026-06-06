import { lazy, Suspense, useEffect, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";


const AchievementToastHost = lazy(() =>
  import("../shared/components/achievements/AchievementToastHost").then((module) => ({
    default: module.AchievementToastHost
  }))
);

// Instanciación única del cliente de peticiones TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

import { GoogleOAuthProvider } from "@react-oauth/google";

/**
 * Proveedor general que envuelve el árbol de componentes.
 * Restaura sesión desde localStorage y expone clientes globales.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const initializeSession = useAuthStore((state) => state.initializeSession);

  useEffect(() => {
    // Restaurar la sesión desde localStorage
    initializeSession();
  }, [initializeSession]);

  const googleClientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Suspense fallback={null}>
          <AchievementToastHost />
        </Suspense>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
