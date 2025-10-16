import { useEffect, useState, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useNotificationStore } from "@/store/notificationStore";
import type { Socket } from "socket.io-client";
import type { Notification } from "@/store/notificationStore";

type UseSocketOptions = {
   userId: string;
   token: string;
   onConnect?: () => void;
   onDisconnect?: () => void;
   onError?: (error: Error) => void;
};

export function useSocket({ userId, token, onConnect, onDisconnect, onError }: UseSocketOptions) {
   const [connected, setConnected] = useState(false);
   const [socket, setSocket] = useState<Socket | null>(null);

   // Get actions from store
   const { setNotifications, addNotification, updateNotification, removeNotification } = useNotificationStore();

   // Use useRef to stabilize callbacks and prevent loops
   const onConnectRef = useRef(onConnect);
   const onDisconnectRef = useRef(onDisconnect);
   const onErrorRef = useRef(onError);

   // Update refs when callbacks change
   useEffect(() => {
      onConnectRef.current = onConnect;
      onDisconnectRef.current = onDisconnect;
      onErrorRef.current = onError;
   }, [onConnect, onDisconnect, onError]);

   useEffect(() => {
      // Get socket instance
      const socketInstance = getSocket(userId, token);

      if (!socketInstance) {
         console.error("❌ Unable to create socket instance");
         return;
      }

      setSocket(socketInstance);

      // Handler: Connection
      const handleConnect = () => {
         console.log("🔌 WebSocket connected");
         setConnected(true);
         onConnectRef.current?.();
      };

      // Handler: Disconnection
      const handleDisconnect = () => {
         console.log("🔌 WebSocket disconnected");
         setConnected(false);
         onDisconnectRef.current?.();
      };

      // Handler: Error
      const handleError = (error: Error) => {
         console.error("❌ WebSocket error:", error);
         onErrorRef.current?.(error);
      };

      // Handler: Initial notifications (when connecting)
      const handleNotificationsInitial = (notifications: Notification[]) => {
         console.log(`📬 Received ${notifications.length} initial notifications from WebSocket`);
         // Don't overwrite, full loading is done via fetchNotifications
      };

      // Handler: New notification in real-time
      const handleNotificationNew = (notification: Notification) => {
         console.log("🎯 New notification received:", notification);
         addNotification(notification);
      };

      // Handler: Updated notification (from another tab)
      const handleNotificationUpdated = (notification: Notification) => {
         console.log("🔄 Updated notification received:", notification);
         updateNotification(notification.id, notification);
      };

      // Handler: Deleted notification (from another tab)
      const handleNotificationDeleted = (data: { id: string }) => {
         console.log("🗑️ Deleted notification received:", data.id);
         removeNotification(data.id);
      };

      // Handler: All notifications marked as read (from another tab)
      const handleAllRead = () => {
         console.log("✅ All notifications marked as read");
         const notifications = useNotificationStore.getState().notifications;
         notifications.forEach((n) => {
            if (!n.read) {
               updateNotification(n.id, { read: true });
            }
         });
      };

      // Register all listeners
      socketInstance.on("connect", handleConnect);
      socketInstance.on("disconnect", handleDisconnect);
      socketInstance.on("error", handleError);
      socketInstance.on("notifications:initial", handleNotificationsInitial);
      socketInstance.on("notification:new", handleNotificationNew);
      socketInstance.on("notification:updated", handleNotificationUpdated);
      socketInstance.on("notification:deleted", handleNotificationDeleted);
      socketInstance.on("notifications:all-read", handleAllRead);


      // Connect socket
      socketInstance.connect();

      // Cleanup: remove listeners and disconnect
      return () => {
         socketInstance.off("connect", handleConnect);
         socketInstance.off("disconnect", handleDisconnect);
         socketInstance.off("error", handleError);
         socketInstance.off("notifications:initial", handleNotificationsInitial);
         socketInstance.off("notification:new", handleNotificationNew);
         socketInstance.off("notification:updated", handleNotificationUpdated);
         socketInstance.off("notification:deleted", handleNotificationDeleted);
         socketInstance.off("notifications:all-read", handleAllRead);

         socketInstance.disconnect();
      };
   }, [userId, token, setNotifications, addNotification, updateNotification, removeNotification]);


   return { connected, socket };
}
