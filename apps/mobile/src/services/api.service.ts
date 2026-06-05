import { Platform } from "react-native";
import Constants from "expo-constants";
import { useAuthStore } from "../stores/auth.store";
import { ApiError } from "./api-error";

// Obtenemos la IP de tu computadora dinámicamente desde Expo (funciona para emulador y dispositivo físico)
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost ? debuggerHost.split(":")[0] : (Platform.OS === "android" ? "10.0.2.2" : "localhost");

const DEV_FALLBACK_URL = `http://${localIp}:3000/api/v1`;
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_FALLBACK_URL;

let refreshPromise: Promise<{ idToken: string; refreshToken: string } | null> | null = null;
const TOKEN_REFRESH_MARGIN_SECONDS = 120;

function isAuthEndpoint(path: string): boolean {
  return path === "/auth/login" || path === "/auth/register" || path === "/auth/google" || path === "/auth/refresh";
}

function decodeBase64Url(input: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  let output = "";
  let buffer = 0;
  let bits = 0;

  for (const char of padded) {
    if (char === "=") break;
    const value = chars.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

function getJwtExpirationSeconds(token: string | null): number | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const parsed = JSON.parse(decodeBase64Url(payload));
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
    return authStore.token;
  }

  if (!force && !shouldRefreshToken(authStore.token)) {
    return authStore.token;
  }

  if (!refreshPromise) {
    refreshPromise = refreshBackendSession(authStore.refreshToken)
      .then(async (newTokens) => {
        if (newTokens) {
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            await useAuthStore.getState().setSession(newTokens.idToken, currentUser, newTokens.refreshToken);
          }
          return newTokens;
        }

        return null;
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
  const token = isAuthEndpoint(path) ? useAuthStore.getState().token : await getFreshTokenIfNeeded();

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

  try {
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
      
      // Si la sesión expiró (401) o el token de Firebase caducó
      if (response.status === 401 || errorCode === "AUTH_REQUIRED" || errorMessage.includes("Firebase ID token has expired") || errorMessage.includes("auth/id-token-expired")) {
        const authStore = useAuthStore.getState();
        
        if (isAuthEndpoint(path)) {
          await authStore.clearSession();
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
              throw new ApiError(errorMessage, errorCode, retryResponse.status, errorDetails, requestId);
            }

            if (retryResponse.status === 204) return {} as T;
            return (await retryResponse.json()) as T;
          }
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
    if ((result as any)?.meta?.newlyUnlockedAchievements?.length > 0) {
      const { useAchievementToastStore } = await import("../stores/achievement-toast.store");
      useAchievementToastStore.getState().pushAchievements((result as any).meta.newlyUnlockedAchievements);
    }
    
    return result as T;
  } catch (e: any) {
    console.error("HTTP request error on path: " + path, e);
    throw e;
  }
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
