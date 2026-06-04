import { create } from "zustand";

/**
 * Representa la información básica del usuario autenticado.
 */
export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  photoUrl?: string | null;
  role: "STUDENT" | "MODERATOR" | "ADMIN";
  profile?: {
    id: string;
    username: string;
    bio: string | null;
    targetUniversity: string | null;
    bannerUrl?: string | null;
    level: number;
    experience: number;
    currentStreakDays: number;
    longestStreakDays: number;
  } | null;
}

/**
 * Interfaz que define el estado y las acciones del almacenamiento de autenticación.
 */
interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  /**
   * Inicializa la sesión buscando un token persistido en el almacenamiento local.
   */
  initializeSession: () => void;
  
  /**
   * Guarda el token y los datos de usuario en el estado y los persiste en localStorage.
   */
  setSession: (token: string, user: User, refreshToken?: string | null) => void;
  
  /**
   * Limpia el estado de autenticación y remueve la sesión persistida.
   */
  clearSession: () => void;
}

function readPersistedSession(): Pick<AuthState, "token" | "refreshToken" | "user" | "isAuthenticated"> {
  if (typeof localStorage === "undefined") {
    return {
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    };
  }

  const persistedToken = localStorage.getItem("examina_token");
  const persistedRefreshToken = localStorage.getItem("examina_refresh_token");
  const persistedUserJson = localStorage.getItem("examina_user");

  if (!persistedToken || !persistedUserJson) {
    return {
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    };
  }

  try {
    return {
      token: persistedToken,
      refreshToken: persistedRefreshToken,
      user: JSON.parse(persistedUserJson) as User,
      isAuthenticated: true,
    };
  } catch {
    localStorage.removeItem("examina_token");
    localStorage.removeItem("examina_refresh_token");
    localStorage.removeItem("examina_user");
    return {
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    };
  }
}

/**
 * AuthStore: Gestiona el estado de autenticación del usuario mediante Zustand.
 * Mantiene la persistencia en el localStorage para evitar redirecciones al recargar.
 */
export const useAuthStore = create<AuthState>((set) => ({
  ...readPersistedSession(),

  initializeSession: () => {
    // Intentamos recuperar la sesión previamente almacenada
    set(readPersistedSession());
  },

  setSession: (token, user, refreshToken) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("examina_token", token);
      if (refreshToken) {
        localStorage.setItem("examina_refresh_token", refreshToken);
      } else {
        localStorage.removeItem("examina_refresh_token");
      }
      localStorage.setItem("examina_user", JSON.stringify(user));
    }
    set({
      token,
      refreshToken: refreshToken || null,
      user,
      isAuthenticated: true,
    });
  },

  clearSession: () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("examina_token");
      localStorage.removeItem("examina_refresh_token");
      localStorage.removeItem("examina_user");
    }
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
