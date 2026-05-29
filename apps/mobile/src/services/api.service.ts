import { useAuthStore } from "../stores/auth.store";

// Base URL de la API obtenida desde las variables de entorno de Expo o fallback de desarrollo
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

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
      
      // Si la sesión expiró (401), deslogueamos automáticamente
      if (response.status === 401) {
        await useAuthStore.getState().clearSession();
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
