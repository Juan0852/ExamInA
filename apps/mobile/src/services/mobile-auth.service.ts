import { apiService } from "./api.service";

export type MobileAuthResponse = {
  data: {
    user: any;
    auth?: {
      idToken: string;
      refreshToken?: string;
      expiresIn?: number;
    };
  };
  meta: any;
  error: any;
};

export function getGoogleClientIds() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  return {
    webClientId,
    iosClientId,
    androidClientId,
    hasAnyClientId: Boolean(webClientId || iosClientId || androidClientId)
  };
}

export async function loginWithEmailPassword(email: string, password: string): Promise<MobileAuthResponse> {
  return apiService.post<MobileAuthResponse>("/auth/login", {
    email: email.trim(),
    password
  });
}

export async function registerWithEmailPassword(email: string, password: string): Promise<MobileAuthResponse> {
  return apiService.post<MobileAuthResponse>("/auth/register", {
    email: email.trim(),
    password
  });
}

export async function loginWithGoogleToken(idToken: string): Promise<MobileAuthResponse> {
  return apiService.post<MobileAuthResponse>("/auth/google", {
    idToken
  });
}

export interface UpdateProfilePayload {
  displayName?: string;
  username?: string;
  bio?: string;
  targetUniversity?: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<MobileAuthResponse> {
  return apiService.put<MobileAuthResponse>("/auth/profile", payload);
}

export function getReadableAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("INVALID_EMAIL") || message.includes("auth/invalid-email")) {
    return "El correo electrónico no tiene un formato válido.";
  }

  if (
    message.includes("EMAIL_NOT_FOUND") ||
    message.includes("INVALID_PASSWORD") ||
    message.includes("INVALID_LOGIN_CREDENTIALS") ||
    message.includes("auth/user-not-found") ||
    message.includes("auth/invalid-credential")
  ) {
    return "No encontramos una cuenta con esas credenciales.";
  }

  if (message.includes("EMAIL_EXISTS") || message.includes("auth/email-already-in-use")) {
    return "Ese correo ya está registrado. Inicia sesión o usa otro correo.";
  }

  if (message.includes("WEAK_PASSWORD") || message.includes("auth/weak-password")) {
    return "La contraseña es demasiado débil.";
  }

  if (message.includes("popup") || message.includes("dismiss") || message.includes("cancel")) {
    return "El inicio con Google fue cancelado.";
  }

  return message || "No se pudo completar la autenticación.";
}
