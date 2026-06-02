import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { apiService } from "../shared/services/api.service";
import { signInWithGoogle } from "../shared/services/firebase-client.service";

import { loginSchema } from "../shared/validation/schemas";

/**
 * Hook de ViewModel para la vista de inicio de sesión (LoginPage).
 * Encapsula el estado del formulario, la carga de datos, el control de errores
 * y las interacciones con el backend de autenticación Firebase.
 */
export function useLoginViewModel() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  // Estados locales para la vista
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createBackendSession = async (idToken: string) => {
    const response = await apiService.post<{
      data: {
        user: {
          id: string;
          email: string;
          displayName?: string | null;
          photoUrl?: string | null;
          role: "STUDENT" | "ADMIN";
        };
      };
    }>("/auth/session", null, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    setSession(idToken, response.data.user);

    return response.data.user;
  };

  /**
   * Procesa el inicio de sesión convencional con Email y Contraseña.
   * Email/password pasa por el backend porque ahí vive la integración privilegiada
   * con Firebase Auth y la creación/sincronización del usuario local.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.post<{
        data: {
          user: {
            id: string;
            email: string;
            displayName?: string | null;
            photoUrl?: string | null;
            role: "STUDENT" | "ADMIN";
          };
          auth?: {
            idToken: string;
            refreshToken: string;
          };
        };
      }>("/auth/login", {
        email,
        password
      });

      if (!response.data.auth?.idToken) {
        throw new Error("El backend no devolvió un token de sesión válido.");
      }

      setSession(response.data.auth.idToken, response.data.user, response.data.auth.refreshToken);
      
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { idToken } = await signInWithGoogle();
      await createBackendSession(idToken);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    isLoading,
    handleLogin,
    handleGoogleLogin,
  };
}
