import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  updateUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => {
    set({ notifications });
    get().updateUnreadCount();
  },
  addNotification: (notification) => {
    set((state) => ({ notifications: [notification, ...state.notifications] }));
    get().updateUnreadCount();
  },
  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
    }));
    get().updateUnreadCount();
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
    set({ unreadCount: 0 });
  },
  updateUnreadCount: () => {
    const unread = get().notifications.filter((n) => !n.isRead).length;
    set({ unreadCount: unread });
  },
}));
