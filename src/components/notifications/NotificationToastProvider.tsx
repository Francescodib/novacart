"use client";

import { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNotificationStore } from "@/store/notificationStore";
import type { Notification } from "@/store/notificationStore";

/**
 * Provider that automatically shows toasts for new notifications
 * Should be inserted in the root layout
 */
export function NotificationToastProvider() {
   const notifications = useNotificationStore((state) => state.notifications);
   const prevNotificationsRef = useRef<Notification[]>([]);

   useEffect(() => {
      const prevNotifications = prevNotificationsRef.current;

      // Find new notifications (present in notifications but not in prevNotifications)
      const newNotifications = notifications.filter(
         (notif) => !prevNotifications.some((prev) => prev.id === notif.id)
      );

      // Show toast for each new notification
      newNotifications.forEach((notification) => {
         showNotificationToast(notification);
      });

      // Update ref
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
 * Helper function to show a custom toast
 */
function showNotificationToast(notification: Notification) {
   // Map types to icons/colors
   const typeConfig: Record<string, { icon: string; color: string }> = {
      ORDER_SHIPPED: { icon: "📦", color: "bg-emerald-500" },
      ORDER_DELIVERED: { icon: "✅", color: "bg-emerald-600" },
      ORDER_CANCELLED: { icon: "❌", color: "bg-red-500" },
      PROMOTION: { icon: "🎉", color: "bg-emerald-500" },
      NEW_OFFER: { icon: "✨", color: "bg-emerald-500" },
      PRICE_DROP: { icon: "💰", color: "bg-emerald-600" },
      BACK_IN_STOCK: { icon: "🔄", color: "bg-emerald-500" },
      LOW_STOCK: { icon: "⚠️", color: "bg-orange-500" },
   };

   const config = typeConfig[notification.type] || {
      icon: "🔔",
      color: "bg-neutral-700",
   };

   // Use regular toast() instead of toast.custom() to avoid glitches
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
            {/* Icon */}
            <div
               className={`
                  flex-shrink-0 w-10 h-10 rounded-lg ${config.color}
                  flex items-center justify-center text-xl
               `}
            >
               {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
               <h4 className="font-semibold text-white text-sm mb-1">
                  {notification.title}
               </h4>
               <p className="text-neutral-300 text-sm line-clamp-2">
                  {notification.message}
               </p>
            </div>

            {/* Close Button */}
            <button
               onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
               }}
               className="flex-shrink-0 text-neutral-400 hover:text-white transition"
            >
               ✕
            </button>
         </div>
      ),
      {
         duration: 5000,
         id: notification.id,
         style: {
            background: '#171717', // neutral-900
            border: '1px solid #262626', // neutral-800
            padding: '16px',
            borderRadius: '0.75rem',
            maxWidth: '28rem',
         },
      }
   );
}
