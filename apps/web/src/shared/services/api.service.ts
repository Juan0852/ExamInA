import { useAuthStore } from "../../stores/auth.store";
import { useAchievementToastStore } from "../achievements/achievement-toast.store";
import { ApiError } from "../errors/api-error";

// Base URL de la API obtenida desde variables de entorno de Vite o fallback de desarrollo
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

let refreshPromise: Promise<{ idToken: string; refreshToken: string } | null> | null = null;
const TOKEN_REFRESH_MARGIN_SECONDS = 120;

function isAuthEndpoint(path: string): boolean {
  return path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/google" ||
    path === "/auth/refresh";
}

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

function getJwtExpirationSeconds(token: string | null): number | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const parsed = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown };
    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
}

function shouldRefreshToken(token: string | null): boolean {
  const expirationSeconds = getJwtExpirationSeconds(token);
  if (!expirationSeconds) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return expirationSeconds - nowSeconds <= TOKEN_REFRESH_MARGIN_SECONDS;
}

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

async function getFreshTokenIfNeeded(force = false): Promise<string | null> {
  const authStore = useAuthStore.getState();

  if (!authStore.token || !authStore.refreshToken || !authStore.user) {
    return force ? null : authStore.token;
  }

  if (!force && !shouldRefreshToken(authStore.token)) {
    return authStore.token;
  }

  if (!refreshPromise) {
    refreshPromise = refreshBackendSession(authStore.refreshToken)
      .then((newTokens) => {
        if (!newTokens) return null;

        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return null;

        useAuthStore.getState().setSession(
          newTokens.idToken,
          currentUser,
          newTokens.refreshToken
        );
        return newTokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  const newTokens = await refreshPromise;
  return newTokens?.idToken ?? (force ? null : authStore.token);
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
  const token = isAuthEndpoint(path)
    ? useAuthStore.getState().token
    : await getFreshTokenIfNeeded();

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
      
      if (isAuthEndpoint(path)) {
        authStore.clearSession();
        throw new ApiError(errorMessage, errorCode, response.status, errorDetails, requestId);
      }

      if (authStore.refreshToken && authStore.user) {
        const freshToken = await getFreshTokenIfNeeded(true);
        if (freshToken) {
          const retryHeaders = new Headers(options.headers || {});
          retryHeaders.set("Authorization", `Bearer ${freshToken}`);
          if (!retryHeaders.has("Content-Type") && !(options.body instanceof FormData)) {
            retryHeaders.set("Content-Type", "application/json");
          }
          
          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
            body,
          });

          if (!retryResponse.ok) {
            if (retryResponse.status === 401) {
              useAuthStore.getState().clearSession();
            }
            throw new ApiError(errorMessage, errorCode, retryResponse.status, errorDetails, requestId);
          }

          if (retryResponse.status === 204) return {} as T;
          
          const result = await retryResponse.json();
          if (result && typeof result === "object" && (result as any).meta && Array.isArray((result as any).meta.newlyUnlockedAchievements)) {
            useAchievementToastStore.getState().pushAchievements((result as any).meta.newlyUnlockedAchievements);
          }
          return result as T;
        }
      }

      useAuthStore.getState().clearSession();
      throw new ApiError(errorMessage, errorCode, response.status, errorDetails, requestId);
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
