"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useSession, signOut } from "next-auth/react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import Link from "next/link";

export default function DashboardPage() {
   const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

   // Ottieni sessione utente
   const { data: session, status } = useSession();

   // Connetti al WebSocket solo se autenticato
   const { connected } = useSocket({
      userId: session?.user?.id || "",
      token: session?.user?.accessToken || "",
   });

   const { unreadCount, fetch: fetchNotifications } = useNotifications();

   // Carica notifiche al mount
   useEffect(() => {
      if (session?.user?.id) {
         fetchNotifications();
      }
   }, [fetchNotifications, session?.user?.id]);

   // Mostra loading mentre carica la sessione
   if (status === "loading") {
      return (
         <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
               <p className="text-white text-lg">Caricamento...</p>
            </div>
         </div>
      );
   }

   // Redirect a login se non autenticato
   if (status === "unauthenticated" || !session?.user?.id) {
      return (
         <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center max-w-md">
               <h1 className="text-3xl font-bold text-white mb-4">🔒 Accesso Richiesto</h1>
               <p className="text-gray-300 mb-6">
                  Devi essere autenticato per accedere alla dashboard.
               </p>
               <Link
                  href="/auth/login?callbackUrl=/dashboard"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
               >
                  Vai al Login
               </Link>
               <p className="text-gray-500 text-sm mt-4">
                  Per testing, usa la{" "}
                  <a href="/test-socket" className="text-blue-400 underline">
                     pagina di test
                  </a>
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
         {/* Navbar */}
         <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">N</span>
                     </div>
                     <h1 className="text-xl font-bold text-white">NovaCart</h1>
                  </div>

                  {/* Navigation */}
                  <div className="hidden md:flex items-center gap-6">
                     <a href="#" className="text-gray-300 hover:text-white transition">
                        Prodotti
                     </a>
                     <a href="#" className="text-gray-300 hover:text-white transition">
                        Offerte
                     </a>
                     <a href="#" className="text-gray-300 hover:text-white transition">
                        Carrello
                     </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                     {/* Status Connection (solo per debug) */}
                     <div className="hidden sm:flex items-center gap-2">
                        <div
                           className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <span className="text-xs text-gray-400">
                           {connected ? "Online" : "Offline"}
                        </span>
                     </div>

                     {/* Notification Bell */}
                     <div className="relative">
                        <NotificationBell
                           onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
                        />

                        {/* Notification Center */}
                        <NotificationCenter
                           isOpen={isNotificationCenterOpen}
                           onClose={() => setIsNotificationCenterOpen(false)}
                        />
                     </div>

                     {/* User Menu */}
                     <div className="relative">
                        <button
                           onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                           className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-medium hover:bg-gray-600 transition"
                        >
                           {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                           <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50">
                              <div className="px-4 py-2 border-b border-gray-700">
                                 <p className="text-sm font-medium text-white truncate">
                                    {session?.user?.name || "User"}
                                 </p>
                                 <p className="text-xs text-gray-400 truncate">
                                    {session?.user?.email}
                                 </p>
                              </div>
                              <button
                                 onClick={() => signOut({ callbackUrl: "/auth/login" })}
                                 className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition"
                              >
                                 Logout
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </nav>

         {/* Main Content */}
         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-xl">
               <h2 className="text-3xl font-bold text-white mb-2">
                  Benvenuto su NovaCart! 🛒
               </h2>
               <p className="text-blue-100 mb-4">
                  Il tuo e-commerce con notifiche in tempo reale. Ricevi aggiornamenti istantanei
                  sui tuoi ordini, offerte esclusive e molto altro!
               </p>
               <div className="flex gap-4">
                  <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                     Scopri i Prodotti
                  </button>
                  <button className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition">
                     Vedi Offerte
                  </button>
               </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-gray-400 text-sm font-medium">Notifiche Non Lette</h3>
                     <span className="text-2xl">📬</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{unreadCount}</p>
               </div>

               <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-gray-400 text-sm font-medium">Ordini Attivi</h3>
                     <span className="text-2xl">📦</span>
                  </div>
                  <p className="text-3xl font-bold text-white">3</p>
               </div>

               <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-gray-400 text-sm font-medium">Offerte Disponibili</h3>
                     <span className="text-2xl">🎉</span>
                  </div>
                  <p className="text-3xl font-bold text-white">12</p>
               </div>
            </div>

            {/* Products Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
               <h3 className="text-xl font-bold text-white mb-4">Prodotti in Evidenza</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                     <div
                        key={i}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition cursor-pointer"
                     >
                        <div className="w-full h-32 bg-gray-600 rounded-lg mb-3 flex items-center justify-center text-4xl">
                           📱
                        </div>
                        <h4 className="text-white font-semibold mb-1">Prodotto {i}</h4>
                        <p className="text-gray-400 text-sm mb-2">Descrizione breve</p>
                        <div className="flex items-center justify-between">
                           <span className="text-blue-400 font-bold">€99.99</span>
                           <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                              Aggiungi
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Info Footer */}
            <div className="mt-8 text-center">
               <p className="text-gray-500 text-sm">
                  💡 <strong>Prova le notifiche:</strong> Vai alla{" "}
                  <a href="/test-socket" className="text-blue-400 hover:text-blue-300 underline">
                     pagina di test
                  </a>{" "}
                  per creare notifiche e vedere il sistema in azione!
               </p>
            </div>
         </main>
      </div>
   );
}