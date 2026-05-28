import { lazy, Suspense, useEffect, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { subscribeToAuthChanges } from "../shared/services/firebase-client.service";

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

/**
 * Proveedor general que envuelve el árbol de componentes.
 * Restaura sesión desde localStorage y, si el Firebase Client SDK conoce al usuario
 * (login con Google), refresca el token automáticamente.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    // Siempre restaurar la sesión desde localStorage primero.
    // Esto cubre usuarios de email/password cuya sesión fue creada en el backend.
    initializeSession();

    // Adicionalmente, escuchar a Firebase Client SDK.
    // Si Firebase conoce al usuario (login con Google), obtenemos un token fresco.
    // Si Firebase devuelve null (email/password backend-auth), NO borramos la sesión.
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        const freshToken = await firebaseUser.getIdToken(true);
        const storedUserJson =
          typeof localStorage !== "undefined"
            ? localStorage.getItem("examina_user")
            : null;
        if (storedUserJson) {
          try {
            const user = JSON.parse(storedUserJson);
            setSession(freshToken, user);
          } catch {
            // JSON corrupto — no hacer nada, dejar la sesión como está
          }
        }
      }
      // Si firebaseUser === null: el usuario se autenticó vía backend (email/password).
      // No hacer nada — la sesión de localStorage sigue vigente.
    });

    return () => unsubscribe();
  }, [initializeSession, setSession]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Suspense fallback={null}>
        <AchievementToastHost />
      </Suspense>
    </QueryClientProvider>
  );
}
