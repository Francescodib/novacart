import type { Notification } from "@/store/notificationStore";

type NotificationItemProps = {
   notification: Notification;
   onMarkAsRead?: (id: string) => void;
   onDelete?: (id: string) => void;
   onClick?: (notification: Notification) => void;
   compact?: boolean;
   showActions?: boolean;
};

export function NotificationItem({
   notification,
   onMarkAsRead,
   onDelete,
   onClick,
   compact = false,
   showActions = true,
}: NotificationItemProps) {
   // Mappa i tipi di notifica a icone/colori
   const typeConfig = {
      ORDER_SHIPPED: { icon: "📦", color: "bg-blue-500" },
      ORDER_DELIVERED: { icon: "✅", color: "bg-green-500" },
      ORDER_CANCELLED: { icon: "❌", color: "bg-red-500" },
      PROMOTION: { icon: "🎉", color: "bg-purple-500" },
      NEW_OFFER: { icon: "✨", color: "bg-yellow-500" },
      PRICE_DROP: { icon: "💰", color: "bg-green-600" },
      BACK_IN_STOCK: { icon: "🔄", color: "bg-indigo-500" },
      LOW_STOCK: { icon: "⚠️", color: "bg-orange-500" },
   };

   const config = typeConfig[notification.type as keyof typeof typeConfig] || {
      icon: "🔔",
      color: "bg-gray-500",
   };

   return (
      <div
         onClick={() => onClick?.(notification)}
         className={`
            ${compact ? "p-3" : "p-4"}
            ${notification.read ? "bg-gray-800 opacity-75" : "bg-gray-900"}
            ${onClick ? "cursor-pointer hover:bg-gray-700" : ""}
            border border-gray-700 rounded-lg transition-all duration-200
            ${!notification.read ? "border-l-4 border-l-blue-500" : ""}
         `}
      >
         <div className="flex gap-3">
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
               <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-white text-sm">
                     {notification.title}
                  </h4>
                  {!compact && !notification.read && (
                     <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
               </div>

               <p className={`text-gray-300 text-sm ${compact ? "line-clamp-1" : "line-clamp-2"}`}>
                  {notification.message}
               </p>

               {!compact && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                     <span className="px-2 py-0.5 bg-gray-700 rounded">
                        {notification.type.replace(/_/g, " ")}
                     </span>
                     <span>
                        {new Date(notification.createdAt).toLocaleDateString("it-IT", {
                           day: "numeric",
                           month: "short",
                           hour: "2-digit",
                           minute: "2-digit",
                        })}
                     </span>
                  </div>
               )}
            </div>

            {/* Azioni */}
            {showActions && !compact && (
               <div className="flex flex-col gap-1 ml-2">
                  {!notification.read && onMarkAsRead && (
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           onMarkAsRead(notification.id);
                        }}
                        className="p-1.5 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded transition"
                        title="Segna come letta"
                     >
                        <svg
                           className="w-4 h-4"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                           />
                        </svg>
                     </button>
                  )}

                  {onDelete && (
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           onDelete(notification.id);
                        }}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition"
                        title="Elimina"
                     >
                        <svg
                           className="w-4 h-4"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                           />
                        </svg>
                     </button>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}