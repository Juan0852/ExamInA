import { create } from "zustand";

interface NotificationsStoreState {
  isDrawerOpen: boolean;
  unreadCount: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationsStore = create<NotificationsStoreState>((set) => ({
  isDrawerOpen: false,
  unreadCount: 0,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
