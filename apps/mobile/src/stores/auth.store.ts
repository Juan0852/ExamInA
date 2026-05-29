import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    level: number;
    experience: number;
    currentStreakDays: number;
    longestStreakDays: number;
  } | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  initializeSession: () => Promise<void>;
  setSession: (token: string, user: User) => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initializeSession: async () => {
    try {
      const persistedToken = await AsyncStorage.getItem("examina_token");
      const persistedUserJson = await AsyncStorage.getItem("examina_user");
      if (persistedToken && persistedUserJson) {
        set({
          token: persistedToken,
          user: JSON.parse(persistedUserJson) as User,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      try {
        await AsyncStorage.removeItem("examina_token");
        await AsyncStorage.removeItem("examina_user");
      } catch (e) {
        // Ignore secondary storage errors
      }
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setSession: async (token, user) => {
    try {
      await AsyncStorage.setItem("examina_token", token);
      await AsyncStorage.setItem("examina_user", JSON.stringify(user));
      set({
        token,
        user,
        isAuthenticated: true,
      });
    } catch (e) {
      console.error("Failed to save auth session", e);
    }
  },

  clearSession: async () => {
    try {
      await AsyncStorage.removeItem("examina_token");
      await AsyncStorage.removeItem("examina_user");
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    } catch (e) {
      console.error("Failed to clear auth session", e);
    }
  },
}));
