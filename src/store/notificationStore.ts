import { create } from "zustand";

// Type for a notification (aligned with Prisma model)
export type Notification = {
   id: string;
   userId: string;
   type: string;
   title: string;
   message: string;
   read: boolean;
   metadata?: any;
   actionUrl?: string | null;
   createdAt: Date | string;
};

// Type for store state
type NotificationState = {
   // State
   notifications: Notification[];
   loading: boolean;
   error: string | null;
   unreadCount: number;

   // Actions
   setNotifications: (notifications: Notification[]) => void;
   addNotification: (notification: Notification) => void;
   updateNotification: (id: string, updates: Partial<Notification>) => void;
   removeNotification: (id: string) => void;
   markAsRead: (id: string) => void;
   markAllAsRead: () => Promise<void>;
   clearAll: () => void;
   setLoading: (loading: boolean) => void;
   setError: (error: string | null) => void;

   // API Actions
   fetchNotifications: () => Promise<void>;
   deleteNotification: (id: string) => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
   // Initial state
   notifications: [],
   loading: false,
   error: null,
   unreadCount: 0,

   // Actions
   setNotifications: (notifications) => {
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount });
   },

   addNotification: (notification) => {
      set((state) => ({
         notifications: [notification, ...state.notifications],
         unreadCount: !notification.read ? state.unreadCount + 1 : state.unreadCount,
      }));
   },

   updateNotification: (id, updates) => {
      set((state) => {
         const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, ...updates } : n
         );
         const unreadCount = notifications.filter((n) => !n.read).length;
         return { notifications, unreadCount };
      });
   },

   removeNotification: (id) => {
      set((state) => {
         const notifications = state.notifications.filter((n) => n.id !== id);
         const unreadCount = notifications.filter((n) => !n.read).length;
         return { notifications, unreadCount };
      });
   },

   markAsRead: (id) => {
      get().updateNotification(id, { read: true });
   },

   markAllAsRead: async () => {
      try {
         const res = await fetch("/api/notifications/mark-all-read", {
            method: "PUT",
         });

         if (res.ok) {
            // Update local store
            set((state) => ({
               notifications: state.notifications.map((n) => ({ ...n, read: true })),
               unreadCount: 0,
            }));
         } else {
            const data = await res.json();
            set({ error: data.error || "Update error" });
         }
      } catch (error) {
         set({ error: "Network error" });
      }
   },

   clearAll: () => {
      set({ notifications: [], unreadCount: 0, error: null });
   },

   setLoading: (loading) => set({ loading }),

   setError: (error) => set({ error }),

   // API Actions
   fetchNotifications: async () => {
      try {
         set({ loading: true, error: null });
         const res = await fetch("/api/notifications");
         const data = await res.json();

         if (res.ok) {
            get().setNotifications(data.notifications);
         } else {
            set({ error: data.error || "Loading error" });
         }
      } catch (error) {
         set({ error: "Network error" });
      } finally {
         set({ loading: false });
      }
   },

   deleteNotification: async (id: string) => {
      try {
         const res = await fetch(`/api/notifications/${id}`, {
            method: "DELETE",
         });

         if (res.ok) {
            get().removeNotification(id);
         } else {
            const data = await res.json();
            set({ error: data.error || "Delete error" });
         }
      } catch (error) {
         set({ error: "Network error" });
      }
   },
}));