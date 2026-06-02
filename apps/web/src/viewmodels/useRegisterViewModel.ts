import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { apiService } from "../shared/services/api.service";
import { signInWithGoogle } from "../shared/services/firebase-client.service";
import { registerSchema } from "../shared/validation/schemas";

/**
 * Hook de ViewModel para la vista de registro.
 * Gestiona el estado de creación de cuenta, validaciones con Zod y redirección al Onboarding.
 */
export function useRegisterViewModel() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  // Estados locales del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
   * Realiza el registro con correo y contraseña.
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validamos con el esquema de registro
    const validationResult = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const displayName = email.split("@")[0] || "Estudiante";
      
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
      }>("/auth/register", {
        email,
        password,
        displayName,
      });

      const { user, auth } = response.data;

      // Guardamos la sesión en el Zustand store y localStorage
      setSession(auth.idToken, user, auth.refreshToken);

      // Redirigimos a la pantalla de Onboarding
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { idToken } = await signInWithGoogle();
      await createBackendSession(idToken);
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.message || "Error al registrarte con Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    isLoading,
    handleRegister,
    handleGoogleRegister,
  };
}
