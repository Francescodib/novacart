"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";

type NotificationBellProps = {
   onClick?: () => void;
   className?: string;
};

export function NotificationBell({ onClick, className = "" }: NotificationBellProps) {
   const { unreadCount } = useNotifications();
   const [shake, setShake] = useState(false);
   const [prevCount, setPrevCount] = useState(0);

   // Trigger animazione shake quando aumenta il contatore
   useEffect(() => {
      if (unreadCount > prevCount && prevCount > 0) {
         setShake(true);
         setTimeout(() => setShake(false), 1000);
      }
      setPrevCount(unreadCount);
   }, [unreadCount, prevCount]);

   return (
      <button
         onClick={onClick}
         className={`
            relative p-2 rounded-lg 
            text-gray-300 hover:text-white hover:bg-gray-800 
            transition-all duration-200
            ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}
            ${className}
         `}
         aria-label={`Notifiche${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
      >
         {/* Icona Campanella SVG */}
         <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
         </svg>

         {/* Badge Contatore */}
         {unreadCount > 0 && (
            <span
               className="
                  absolute -top-1 -right-1 
                  flex items-center justify-center
                  min-w-[20px] h-5 px-1.5
                  bg-red-500 text-white text-xs font-bold
                  rounded-full border-2 border-gray-900
                  animate-pulse
               "
            >
               {unreadCount > 99 ? "99+" : unreadCount}
            </span>
         )}
      </button>
   );
}