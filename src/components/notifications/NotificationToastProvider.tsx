"use client";

import { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNotificationStore } from "@/store/notificationStore";
import type { Notification } from "@/store/notificationStore";

/**
 * Provider che mostra automaticamente toast per nuove notifiche
 * Va inserito nel layout root
 */
export function NotificationToastProvider() {
   const notifications = useNotificationStore((state) => state.notifications);
   const prevNotificationsRef = useRef<Notification[]>([]);

   useEffect(() => {
      const prevNotifications = prevNotificationsRef.current;

      // Trova notifiche nuove (presenti in notifications ma non in prevNotifications)
      const newNotifications = notifications.filter(
         (notif) => !prevNotifications.some((prev) => prev.id === notif.id)
      );

      // Mostra toast per ogni nuova notifica
      newNotifications.forEach((notification) => {
         showNotificationToast(notification);
      });

      // Aggiorna il ref
      prevNotificationsRef.current = notifications;
   }, [notifications]);

   return (
      <Toaster
         position="top-right"
         toastOptions={{
            duration: 5000,
         }}
      />
   );
}

/**
 * Funzione helper per mostrare un toast personalizzato
 */
function showNotificationToast(notification: Notification) {
   // Mappa tipi a icone/colori
   const typeConfig: Record<string, { icon: string; color: string }> = {
      ORDER_SHIPPED: { icon: "📦", color: "bg-blue-500" },
      ORDER_DELIVERED: { icon: "✅", color: "bg-green-500" },
      ORDER_CANCELLED: { icon: "❌", color: "bg-red-500" },
      PROMOTION: { icon: "🎉", color: "bg-purple-500" },
      NEW_OFFER: { icon: "✨", color: "bg-yellow-500" },
      PRICE_DROP: { icon: "💰", color: "bg-green-600" },
      BACK_IN_STOCK: { icon: "🔄", color: "bg-indigo-500" },
      LOW_STOCK: { icon: "⚠️", color: "bg-orange-500" },
   };

   const config = typeConfig[notification.type] || {
      icon: "🔔",
      color: "bg-gray-500",
   };

   // Usa toast() normale invece di toast.custom() per evitare glitch
   toast(
      (t) => (
         <div
            onClick={() => {
               toast.dismiss(t.id);
               if (notification.actionUrl) {
                  window.location.href = notification.actionUrl;
               }
            }}
            className="flex gap-3 cursor-pointer"
         >
            {/* Icona */}
            <div
               className={`
                  flex-shrink-0 w-10 h-10 rounded-full ${config.color} 
                  flex items-center justify-center text-xl
               `}
            >
               {config.icon}
            </div>

            {/* Contenuto */}
            <div className="flex-1 min-w-0">
               <h4 className="font-semibold text-white text-sm mb-1">
                  {notification.title}
               </h4>
               <p className="text-gray-300 text-sm line-clamp-2">
                  {notification.message}
               </p>
            </div>

            {/* Pulsante Chiudi */}
            <button
               onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
               }}
               className="flex-shrink-0 text-gray-400 hover:text-white transition"
            >
               ✕
            </button>
         </div>
      ),
      {
         duration: 5000,
         id: notification.id,
         style: {
            background: '#111827', // gray-900
            border: '1px solid #374151', // gray-700
            padding: '16px',
            borderRadius: '0.5rem',
            maxWidth: '28rem',
         },
      }
   );
}