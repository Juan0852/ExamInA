import { useAuthStore } from "../../stores/auth.store";
import { useAchievementToastStore } from "../achievements/achievement-toast.store";
import { ApiError } from "../errors/api-error";

// Base URL de la API obtenida desde variables de entorno de Vite o fallback de desarrollo
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

let refreshPromise: Promise<{ idToken: string; refreshToken: string } | null> | null = null;

async function refreshBackendSession(refreshToken: string): Promise<{ idToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      idToken: data.data.auth.idToken,
      refreshToken: data.data.auth.refreshToken || refreshToken
    };
  } catch (error) {
    return null;
  }
}

/**
 * Define las opciones de configuración para las peticiones HTTP.
 */
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
}

/**
 * Wrapper genérico sobre fetch para centralizar llamadas HTTP, manejo de errores,
 * y la inyección transparente del Bearer Token de autenticación de Firebase.
 */
async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = useAuthStore.getState().token;

  // Cabeceras por defecto
  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Inyectar token de autorización si el usuario está autenticado
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Serialización del cuerpo
  let body: any = undefined;
  if (options.body) {
    body = options.body instanceof FormData ? options.body : JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  // Manejo de respuesta de error
  if (!response.ok) {
    let errorMessage = "Ocurrió un error inesperado.";
    let errorCode = "UNKNOWN_ERROR";
    let errorDetails: unknown = undefined;
    let requestId: string | undefined = undefined;

    try {
      const errorData = await response.json();
      
      errorMessage = errorData?.error?.message ?? errorData?.message ?? response.statusText ?? "Ocurrió un error inesperado.";
      errorCode = errorData?.error?.code ?? errorData?.code ?? "UNKNOWN_ERROR";
      errorDetails = errorData?.error?.details;
      requestId = errorData?.error?.requestId;
      
      if (Array.isArray(errorData?.message) && !errorData?.error?.message) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      errorMessage = response.statusText || "Error de red o servidor offline.";
    }
    
    // Si la sesión expiró (401), intentamos refrescar o deslogueamos
    if (response.status === 401 || errorCode === "AUTH_REQUIRED" || errorMessage.includes("Firebase ID token has expired") || errorMessage.includes("auth/id-token-expired")) {
      const authStore = useAuthStore.getState();
      
      if (path === "/auth/login" || path === "/auth/register" || path === "/auth/google") {
        authStore.clearSession();
        throw new ApiError(errorMessage, errorCode, response.status, errorDetails, requestId);
      }

      if (authStore.refreshToken && authStore.user) {
        if (!refreshPromise) {
          refreshPromise = refreshBackendSession(authStore.refreshToken).then((newTokens) => {
            if (newTokens) {
              useAuthStore.getState().setSession(newTokens.idToken, useAuthStore.getState().user!, newTokens.refreshToken);
              return newTokens;
            } else {
              useAuthStore.getState().clearSession();
              return null;
            }
          }).finally(() => {
            refreshPromise = null;
          });
        }

        const newTokens = await refreshPromise;
        if (newTokens) {
          const retryHeaders = new Headers(options.headers || {});
          retryHeaders.set("Authorization", `Bearer ${newTokens.idToken}`);
          if (!retryHeaders.has("Content-Type") && !(options.body instanceof FormData)) {
            retryHeaders.set("Content-Type", "application/json");
          }
          
          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
            body,
          });

          if (!retryResponse.ok) {
            throw new ApiError(errorMessage, errorCode, retryResponse.status, errorDetails, requestId);
          }

          if (retryResponse.status === 204) return {} as T;
          
          const result = await retryResponse.json();
          if (result && typeof result === "object" && (result as any).meta && Array.isArray((result as any).meta.newlyUnlockedAchievements)) {
            useAchievementToastStore.getState().pushAchievements((result as any).meta.newlyUnlockedAchievements);
          }
          return result as T;
        }
      } else {
        useAuthStore.getState().clearSession();
        throw new ApiError(errorMessage, errorCode, response.status, errorDetails, requestId);
      }
    }
    
    throw new ApiError(errorMessage, errorCode, response.status, errorDetails, requestId);
  }

  // Si la respuesta no tiene contenido (ej. 204 No Content), retornamos vacío
  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json();

  // Interceptar respuesta para mostrar toasts de logros desbloqueados globalmente
  if (result && typeof result === "object" && (result as any).meta && Array.isArray((result as any).meta.newlyUnlockedAchievements)) {
    useAchievementToastStore.getState().pushAchievements((result as any).meta.newlyUnlockedAchievements);
  }

  return result as T;
}

/**
 * Servicio API estructurado que expone los verbos HTTP principales.
 */
export const apiService = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    httpRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    httpRequest<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    httpRequest<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    httpRequest<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    httpRequest<T>(path, { ...options, method: "DELETE" }),
};
