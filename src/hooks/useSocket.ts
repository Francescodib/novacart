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

   // Otteniamo le actions dello store
   const { setNotifications, addNotification, updateNotification, removeNotification } = useNotificationStore();

   // Usa useRef per stabilizzare i callbacks e prevenire loop
   const onConnectRef = useRef(onConnect);
   const onDisconnectRef = useRef(onDisconnect);
   const onErrorRef = useRef(onError);

   // Aggiorna i ref quando i callbacks cambiano
   useEffect(() => {
      onConnectRef.current = onConnect;
      onDisconnectRef.current = onDisconnect;
      onErrorRef.current = onError;
   }, [onConnect, onDisconnect, onError]);

   useEffect(() => {
      // Ottieni l'istanza del socket
      const socketInstance = getSocket(userId, token);

      if (!socketInstance) {
         console.error("❌ Impossibile creare l'istanza del socket");
         return;
      }

      setSocket(socketInstance);

      // Handler: Connessione
      const handleConnect = () => {
         console.log("🔌 WebSocket connesso");
         setConnected(true);
         onConnectRef.current?.();
      };

      // Handler: Disconnessione
      const handleDisconnect = () => {
         console.log("🔌 WebSocket disconnesso");
         setConnected(false);
         onDisconnectRef.current?.();
      };

      // Handler: Errore
      const handleError = (error: Error) => {
         console.error("❌ WebSocket errore:", error);
         onErrorRef.current?.(error);
      };

      // Handler: Notifiche iniziali (quando ci si connette)
      const handleNotificationsInitial = (notifications: Notification[]) => {
         console.log(`📬 Ricevute ${notifications.length} notifiche iniziali dal WebSocket`);
         // Non sovrascrivere, il caricamento completo viene fatto tramite fetchNotifications
      };

      // Handler: Nuova notifica in tempo reale
      const handleNotificationNew = (notification: Notification) => {
         console.log("🎯 Nuova notifica ricevuta:", notification);
         addNotification(notification);
      };

      // Handler: Notifica aggiornata (da altra tab)
      const handleNotificationUpdated = (notification: Notification) => {
         console.log("🔄 Notifica aggiornata ricevuta:", notification);
         updateNotification(notification.id, notification);
      };

      // Handler: Notifica eliminata (da altra tab)
      const handleNotificationDeleted = (data: { id: string }) => {
         console.log("🗑️ Notifica eliminata ricevuta:", data.id);
         removeNotification(data.id);
      };

      // Handler: Tutte le notifiche segnate come lette (da altra tab)
      const handleAllRead = () => {
         console.log("✅ Tutte le notifiche segnate come lette");
         const notifications = useNotificationStore.getState().notifications;
         notifications.forEach((n) => {
            if (!n.read) {
               updateNotification(n.id, { read: true });
            }
         });
      };

      // Registra tutti i listener
      socketInstance.on("connect", handleConnect);
      socketInstance.on("disconnect", handleDisconnect);
      socketInstance.on("error", handleError);
      socketInstance.on("notifications:initial", handleNotificationsInitial);
      socketInstance.on("notification:new", handleNotificationNew);
      socketInstance.on("notification:updated", handleNotificationUpdated);
      socketInstance.on("notification:deleted", handleNotificationDeleted);
      socketInstance.on("notifications:all-read", handleAllRead);


      // Connetti il socket
      socketInstance.connect();

      // Cleanup: rimuovi listener e disconnetti
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