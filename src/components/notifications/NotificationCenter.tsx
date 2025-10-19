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
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
               {/* Header */}
               <div className="p-5 border-b border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-white">Notifications</h3>
                     <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition"
                        aria-label="Close"
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

                  {/* Filters and Actions */}
                  <div className="flex items-center justify-between gap-2">
                     {/* Filters */}
                     <div className="flex gap-2">
                        <button
                           onClick={() => setFilter("all")}
                           className={`
                              px-3 py-1.5 rounded-lg text-sm font-medium transition
                              ${filter === "all"
                                 ? "bg-emerald-500 text-white"
                                 : "bg-neutral-950 border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                              }
                           `}
                        >
                           All ({notifications.length})
                        </button>
                        <button
                           onClick={() => setFilter("unread")}
                           className={`
                              px-3 py-1.5 rounded-lg text-sm font-medium transition
                              ${filter === "unread"
                                 ? "bg-emerald-500 text-white"
                                 : "bg-neutral-950 border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                              }
                           `}
                        >
                           Unread ({unreadNotifications.length})
                        </button>
                     </div>

                     {/* Mark all as read */}
                     {unreadNotifications.length > 0 && (
                        <button
                           onClick={handleMarkAllAsRead}
                           className="text-xs text-emerald-400 hover:text-emerald-300 transition font-medium"
                        >
                           Mark all
                        </button>
                     )}
                  </div>
               </div>

               {/* Notifications List */}
               <div className="max-h-[500px] overflow-y-auto">
                  {loading ? (
                     <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        <p className="mt-2 text-sm text-neutral-400">Loading...</p>
                     </div>
                  ) : displayedNotifications.length === 0 ? (
                     <div className="p-8 text-center">
                        <div className="text-5xl mb-3">📭</div>
                        <p className="text-neutral-300 font-medium">
                           {filter === "unread" ? "No unread notifications" : "No notifications"}
                        </p>
                        <p className="text-sm text-neutral-500 mt-2">
                           {filter === "unread"
                              ? "All notifications have been read"
                              : "When you receive notifications, they will appear here"}
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
                                 // If there's an actionUrl, navigate
                                 if (notification.actionUrl) {
                                    window.location.href = notification.actionUrl;
                                 }
                                 // Mark as read if not already
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
                  <div className="p-3 border-t border-neutral-800 bg-neutral-950">
                     <button
                        onClick={onClose}
                        className="w-full text-center text-sm text-emerald-400 hover:text-emerald-300 font-medium transition"
                     >
                        Close
                     </button>
                  </div>
               )}
            </div>
         </div>
      </>
   );
}
