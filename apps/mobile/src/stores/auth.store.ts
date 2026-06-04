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
    bannerUrl?: string | null;
    level: number;
    experience: number;
    currentStreakDays: number;
    longestStreakDays: number;
  } | null;
  preferences?: {
    id: string;
    preferredTheme: string;
    preferredLanguage: string;
    notificationsEnabled: boolean;
    studyReminderEnabled: boolean;
    timerSoundEnabled: boolean;
    defaultExamDurationSeconds: number;
    preferredSubjects: unknown;
    weeklyStudyHours: string | null;
    referralSource: string | null;
    onboardingCompleted: boolean;
  } | null;
  progress?: {
    id: string;
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
    totalExamsCompleted: number;
    totalFlashcardsReviewed: number;
    totalStudyTimeSeconds: number;
    averageScore: number;
    level: number;
    experience: number;
  } | null;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  initializeSession: () => Promise<void>;
  setSession: (token: string, user: User, refreshToken?: string | null) => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initializeSession: async () => {
    try {
      const persistedToken = await AsyncStorage.getItem("examina_token");
      const persistedRefreshToken = await AsyncStorage.getItem("examina_refresh_token");
      const persistedUserJson = await AsyncStorage.getItem("examina_user");
      if (persistedToken && persistedUserJson) {
        set({
          token: persistedToken,
          refreshToken: persistedRefreshToken,
          user: JSON.parse(persistedUserJson) as User,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      try {
        await AsyncStorage.removeItem("examina_token");
        await AsyncStorage.removeItem("examina_refresh_token");
        await AsyncStorage.removeItem("examina_user");
      } catch (e) {
        // Ignore secondary storage errors
      }
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setSession: async (token, user, refreshToken) => {
    try {
      await AsyncStorage.setItem("examina_token", token);
      if (refreshToken) {
        await AsyncStorage.setItem("examina_refresh_token", refreshToken);
      } else {
        await AsyncStorage.removeItem("examina_refresh_token");
      }
      await AsyncStorage.setItem("examina_user", JSON.stringify(user));
      set({
        token,
        refreshToken: refreshToken || null,
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
      await AsyncStorage.removeItem("examina_refresh_token");
      await AsyncStorage.removeItem("examina_user");
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    } catch (e) {
      console.error("Failed to clear auth session", e);
    }
  },
}));
