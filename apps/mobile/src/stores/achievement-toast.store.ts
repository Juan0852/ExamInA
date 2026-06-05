import { create } from "zustand";
import type { Achievement } from "../achievements/types";

interface AchievementToastState {
  queue: Achievement[];
  pushAchievements: (achievements: Achievement[]) => void;
  dismissAchievement: (achievementId: string) => void;
}

export const useAchievementToastStore = create<AchievementToastState>((set) => ({
  queue: [],

  pushAchievements: (achievements) => {
    if (!achievements || achievements.length === 0) {
      return;
    }

    set((state) => {
      const existingIds = new Set(state.queue.map((achievement) => achievement.id));
      const nextAchievements = achievements.filter((achievement) => !existingIds.has(achievement.id));

      return {
        queue: [...state.queue, ...nextAchievements]
      };
    });
  },

  dismissAchievement: (achievementId) => {
    set((state) => ({
      queue: state.queue.filter((achievement) => achievement.id !== achievementId)
    }));
  }
}));

export function useAchievementToasts() {
  return useAchievementToastStore((state) => state.pushAchievements);
}
