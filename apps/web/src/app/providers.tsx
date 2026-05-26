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
      refetchOnWindowFocus: false, // Evita peticiones repetitivas al cambiar de pestaña
      retry: 1, // Reintento único en caso de fallo
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Proveedor general que envuelve el árbol de componentes.
 * Inicializa la sesión del usuario persistida y provee el cliente de caché.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const initializeSession = useAuthStore((state) => state.initializeSession);

  // Al montar la aplicación, intentamos restaurar la sesión del usuario
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Suspense fallback={null}>
        <AchievementToastHost />
      </Suspense>
    </QueryClientProvider>
  );
}
