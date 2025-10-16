import { useNotificationStore } from "@/store/notificationStore";
import type { Notification } from "@/store/notificationStore";

/**
 * Custom hook to manage notifications
 * Simplified wrapper of Zustand store
 */
export function useNotifications() {
   // State from store
   const notifications = useNotificationStore((state) => state.notifications);
   const loading = useNotificationStore((state) => state.loading);
   const error = useNotificationStore((state) => state.error);
   const unreadCount = useNotificationStore((state) => state.unreadCount);

   // Actions from store
   const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
   const deleteNotification = useNotificationStore((state) => state.deleteNotification);
   const markAsRead = useNotificationStore((state) => state.markAsRead);
   const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
   const clearAll = useNotificationStore((state) => state.clearAll);
   const addNotification = useNotificationStore((state) => state.addNotification);
   const updateNotification = useNotificationStore((state) => state.updateNotification);

   // Helper function: Create a new notification via API
   const createNotification = async (
      userId: string,
      type: string,
      title: string,
      message: string,
      actionUrl?: string
   ): Promise<{ success: boolean; error?: string; notification?: Notification }> => {
      try {
         useNotificationStore.getState().setLoading(true);

         const res = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               userId,
               type,
               title,
               message,
               actionUrl: actionUrl || null,
            }),
         });

         const data = await res.json();

         if (res.ok) {
            return { success: true, notification: data.notification };
         } else {
            return { success: false, error: data.error || "Error creating notification" };
         }
      } catch (error) {
         return { success: false, error: "Network error" };
      } finally {
         useNotificationStore.getState().setLoading(false);
      }
   };

   // Helper function: Mark as read via API
   const markAsReadAPI = async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
         const res = await fetch(`/api/notifications/${id}/mark-read`, {
            method: "PUT",
         });

         if (res.ok) {
            markAsRead(id); // Update local store too
            return { success: true };
         } else {
            const data = await res.json();
            return { success: false, error: data.error || "Error updating notification" };
         }
      } catch (error) {
         return { success: false, error: "Network error" };
      }
   };

   // Helper function: Get only unread notifications
   const unreadNotifications = notifications.filter((n) => !n.read);

   // Helper function: Get only read notifications
   const readNotifications = notifications.filter((n) => n.read);

   return {
      // State
      notifications,
      unreadNotifications,
      readNotifications,
      loading,
      error,
      unreadCount,

      // Actions
      fetch: fetchNotifications,
      create: createNotification,
      markAsRead: markAsReadAPI,
      markAllAsRead,
      delete: deleteNotification,
      clear: clearAll,

      // Advanced (for special uses)
      addNotification,
      updateNotification,
   };
}
