import { create } from "zustand";

/**
 * Representa la información básica del usuario autenticado.
 */
export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  photoUrl?: string | null;
  role: "STUDENT" | "ADMIN";
  profile?: {
    id: string;
    username: string;
    bio: string | null;
    targetUniversity: string | null;
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
  user: User | null;
  isAuthenticated: boolean;
  
  /**
   * Inicializa la sesión buscando un token persistido en el almacenamiento local.
   */
  initializeSession: () => void;
  
  /**
   * Guarda el token y los datos de usuario en el estado y los persiste en localStorage.
   */
  setSession: (token: string, user: User) => void;
  
  /**
   * Limpia el estado de autenticación y remueve la sesión persistida.
   */
  clearSession: () => void;
}

/**
 * AuthStore: Gestiona el estado de autenticación del usuario mediante Zustand.
 * Mantiene la persistencia en el localStorage para evitar redirecciones al recargar.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  initializeSession: () => {
    // Intentamos recuperar la sesión previamente almacenada
    const persistedToken = localStorage.getItem("examina_token");
    const persistedUserJson = localStorage.getItem("examina_user");

    if (persistedToken && persistedUserJson) {
      try {
        const user = JSON.parse(persistedUserJson) as User;
        set({
          token: persistedToken,
          user,
          isAuthenticated: true,
        });
      } catch {
        // En caso de JSON corrupto, limpiamos localStorage
        localStorage.removeItem("examina_token");
        localStorage.removeItem("examina_user");
      }
    }
  },

  setSession: (token, user) => {
    localStorage.setItem("examina_token", token);
    localStorage.setItem("examina_user", JSON.stringify(user));
    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  clearSession: () => {
    localStorage.removeItem("examina_token");
    localStorage.removeItem("examina_user");
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
