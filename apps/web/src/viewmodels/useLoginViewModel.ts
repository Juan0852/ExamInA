import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { apiService } from "../shared/services/api.service";

import { loginSchema } from "../shared/validation/schemas";

/**
 * Hook de ViewModel para la vista de inicio de sesión (LoginPage).
 * Encapsula el estado del formulario, la carga de datos, el control de errores
 * y las interacciones con el backend de autenticación (tanto Firebase/Mock real como simulación).
 */
export function useLoginViewModel() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  // Estados locales para la vista
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Procesa el inicio de sesión convencional con Email y Contraseña.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validamos la entrada mediante el esquema Zod local
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Invocamos el endpoint de login de la API
      const response = await apiService.post<{
        data: {
          user: {
            id: string;
            email: string;
            displayName?: string | null;
            photoUrl?: string | null;
            role: "STUDENT" | "ADMIN";
          };
          auth: {
            idToken: string;
            refreshToken: string;
            expiresIn: number;
          };
        };
      }>("/auth/login", { email, password });

      const { user, auth } = response.data;
      
      // Guardamos la sesión en el Zustand store (y localStorage)
      setSession(auth.idToken, user);
      
      // Redirigimos al dashboard del estudiante
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Realiza un inicio de sesión de prueba (Mock) sin requerir credenciales reales.
   * Útil para desarrollo local rápido y testeo de la interfaz.
   */
  const handleMockLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mandamos el token de pruebas para sincronizar el usuario interno en la API
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
          Authorization: "Bearer local-test-token",
        },
      });

      const { user } = response.data;
      
      // Guardamos la sesión del usuario de pruebas
      setSession("local-test-token", user);
      
      // Redirigimos
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error en el inicio de sesión mock.");
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
    handleMockLogin,
  };
}
