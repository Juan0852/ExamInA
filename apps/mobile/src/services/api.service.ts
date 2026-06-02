import { Platform } from "react-native";
import Constants from "expo-constants";
import { useAuthStore } from "../stores/auth.store";

// Obtenemos la IP de tu computadora dinámicamente desde Expo (funciona para emulador y dispositivo físico)
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost ? debuggerHost.split(":")[0] : (Platform.OS === "android" ? "10.0.2.2" : "localhost");

const DEV_FALLBACK_URL = `http://${localIp}:3000/api/v1`;
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_FALLBACK_URL;

let refreshPromise: Promise<{ idToken: string; refreshToken: string } | null> | null = null;

async function refreshFirebaseToken(refreshToken: string): Promise<{ idToken: string; refreshToken: string } | null> {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      idToken: data.id_token,
      refreshToken: data.refresh_token || refreshToken
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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
    });

    // Manejo de respuesta de error
    if (!response.ok) {
      let errorMessage = "Ocurrió un error inesperado.";
      try {
        const errorData = await response.json();
        if (typeof errorData?.message === "string") {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData?.message)) {
          errorMessage = errorData.message.join(", ");
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        } else if (typeof errorData?.error === "string") {
          errorMessage = errorData.message || errorData.error;
        }
      } catch {
        errorMessage = response.statusText || "Error de red o servidor offline.";
      }
      
      // Si la sesión expiró (401) o el token de Firebase caducó
      if (response.status === 401 || errorMessage.includes("Firebase ID token has expired") || errorMessage.includes("auth/id-token-expired")) {
        const authStore = useAuthStore.getState();
        
        if (path === "/auth/login" || path === "/auth/register" || path === "/auth/google") {
          await authStore.clearSession();
          throw new Error(errorMessage);
        }

        if (authStore.refreshToken && authStore.user) {
          if (!refreshPromise) {
            refreshPromise = refreshFirebaseToken(authStore.refreshToken).then(async (newTokens) => {
              if (newTokens) {
                await useAuthStore.getState().setSession(newTokens.idToken, useAuthStore.getState().user!, newTokens.refreshToken);
                return newTokens;
              } else {
                await useAuthStore.getState().clearSession();
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
              throw new Error(errorMessage);
            }

            if (retryResponse.status === 204) return {} as T;
            return (await retryResponse.json()) as T;
          }
        } else {
          await authStore.clearSession();
        }
      }
      
      throw new Error(errorMessage);
    }

    // Si la respuesta no tiene contenido (ej. 204 No Content), retornamos vacío
    if (response.status === 204) {
      return {} as T;
    }

    const result = await response.json();
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
