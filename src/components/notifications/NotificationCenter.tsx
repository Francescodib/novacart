"use client";

import { useState } from "react";
import { Menu } from "@headlessui/react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

type NotificationCenterProps = {
   isOpen: boolean;
   onClose: () => void;
};

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
   const {
      notifications,
      unreadNotifications,
      loading,
      markAsRead,
      markAllAsRead,
      delete: deleteNotification,
   } = useNotifications();

   const [filter, setFilter] = useState<"all" | "unread">("all");

   const displayedNotifications = filter === "all" ? notifications : unreadNotifications;

   const handleMarkAsRead = async (id: string) => {
      await markAsRead(id);
   };

   const handleDelete = async (id: string) => {
      await deleteNotification(id);
   };

   const handleMarkAllAsRead = async () => {
      await markAllAsRead();
   };

   if (!isOpen) return null;

   return (
      <>
         {/* Backdrop */}
         <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
         />

         {/* Panel */}
         <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
               {/* Header */}
               <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                     <h3 className="text-lg font-bold text-white">Notifiche</h3>
                     <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition"
                        aria-label="Chiudi"
                     >
                        <svg
                           className="w-5 h-5"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                           />
                        </svg>
                     </button>
                  </div>

                  {/* Filtri e Azioni */}
                  <div className="flex items-center justify-between gap-2">
                     {/* Filtri */}
                     <div className="flex gap-2">
                        <button
                           onClick={() => setFilter("all")}
                           className={`
                              px-3 py-1 rounded-md text-sm font-medium transition
                              ${filter === "all"
                                 ? "bg-blue-500 text-white"
                                 : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              }
                           `}
                        >
                           Tutte ({notifications.length})
                        </button>
                        <button
                           onClick={() => setFilter("unread")}
                           className={`
                              px-3 py-1 rounded-md text-sm font-medium transition
                              ${filter === "unread"
                                 ? "bg-blue-500 text-white"
                                 : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              }
                           `}
                        >
                           Non lette ({unreadNotifications.length})
                        </button>
                     </div>

                     {/* Segna tutte come lette */}
                     {unreadNotifications.length > 0 && (
                        <button
                           onClick={handleMarkAllAsRead}
                           className="text-xs text-blue-400 hover:text-blue-300 transition"
                        >
                           Segna tutte
                        </button>
                     )}
                  </div>
               </div>

               {/* Lista Notifiche */}
               <div className="max-h-[500px] overflow-y-auto">
                  {loading ? (
                     <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-gray-400">Caricamento...</p>
                     </div>
                  ) : displayedNotifications.length === 0 ? (
                     <div className="p-8 text-center">
                        <div className="text-5xl mb-2">📭</div>
                        <p className="text-gray-400 font-medium">
                           {filter === "unread" ? "Nessuna notifica non letta" : "Nessuna notifica"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                           {filter === "unread"
                              ? "Tutte le notifiche sono state lette!"
                              : "Quando riceverai notifiche, appariranno qui."}
                        </p>
                     </div>
                  ) : (
                     <div className="p-3 space-y-2">
                        {displayedNotifications.map((notification) => (
                           <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkAsRead={handleMarkAsRead}
                              onDelete={handleDelete}
                              onClick={() => {
                                 // Se c'è un actionUrl, naviga
                                 if (notification.actionUrl) {
                                    window.location.href = notification.actionUrl;
                                 }
                                 // Segna come letta se non lo è già
                                 if (!notification.read) {
                                    handleMarkAsRead(notification.id);
                                 }
                              }}
                           />
                        ))}
                     </div>
                  )}
               </div>

               {/* Footer */}
               {displayedNotifications.length > 0 && (
                  <div className="p-3 border-t border-gray-700 bg-gray-800">
                     <button
                        onClick={onClose}
                        className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium transition"
                     >
                        Chiudi
                     </button>
                  </div>
               )}
            </div>
         </div>
      </>
   );
}