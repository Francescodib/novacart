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

   // Get user session
   const { data: session, status } = useSession();

   // Connect to WebSocket only if authenticated
   const { connected } = useSocket({
      userId: session?.user?.id || "",
      token: session?.user?.accessToken || "",
   });

   const { unreadCount, fetch: fetchNotifications } = useNotifications();

   // Load notifications on mount
   useEffect(() => {
      if (session?.user?.id) {
         fetchNotifications();
      }
   }, [fetchNotifications, session?.user?.id]);

   // Show loading while loading session
   if (status === "loading") {
      return (
         <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
               <p className="text-white text-lg">Loading...</p>
            </div>
         </div>
      );
   }

   // Redirect to login if not authenticated
   if (status === "unauthenticated" || !session?.user?.id) {
      return (
         <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-center max-w-md">
               <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                  <h1 className="text-3xl font-bold text-white mb-4">Access Required</h1>
                  <p className="text-neutral-400 mb-6">
                     You must be authenticated to access the dashboard.
                  </p>
                  <Link
                     href="/auth/login?callbackUrl=/dashboard"
                     className="inline-block bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition"
                  >
                     Go to Login
                  </Link>
                  <p className="text-neutral-500 text-sm mt-4">
                     For testing, use the{" "}
                     <a href="/test-socket" className="text-emerald-400 hover:underline">
                        test page
                     </a>
                  </p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-black">
         {/* Navbar */}
         <nav className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">N</span>
                     </div>
                     <h1 className="text-xl font-semibold text-white">NovaCart</h1>
                  </div>

                  {/* Navigation */}
                  <div className="hidden md:flex items-center gap-8">
                     <a href="#" className="text-neutral-400 hover:text-white transition font-medium text-sm">
                        Products
                     </a>
                     <a href="#" className="text-neutral-400 hover:text-white transition font-medium text-sm">
                        Offers
                     </a>
                     <a href="#" className="text-neutral-400 hover:text-white transition font-medium text-sm">
                        Cart
                     </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                     {/* Connection Status (for debug only) */}
                     <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                        <div
                           className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`}
                        ></div>
                        <span className="text-xs text-neutral-400 font-medium">
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
                           className="w-9 h-9 bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center text-white text-sm font-medium hover:bg-neutral-700 transition"
                        >
                           {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                           <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50">
                              <div className="px-4 py-3 border-b border-neutral-800">
                                 <p className="text-sm font-medium text-white truncate">
                                    {session?.user?.name || "User"}
                                 </p>
                                 <p className="text-xs text-neutral-400 truncate mt-0.5">
                                    {session?.user?.email}
                                 </p>
                              </div>
                              <button
                                 onClick={() => signOut({ callbackUrl: "/auth/login" })}
                                 className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 transition"
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
         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="bg-neutral-900 border border-emerald-500/20 rounded-2xl p-10 mb-12">
               <h2 className="text-4xl font-bold text-white mb-3">
                  Welcome to NovaCart
               </h2>
               <p className="text-neutral-400 mb-8 text-lg leading-relaxed max-w-2xl">
                  Your e-commerce platform with real-time notifications. Receive instant updates
                  about your orders, exclusive offers and much more.
               </p>
               <div className="flex gap-4">
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition">
                     Discover Products
                  </button>
                  <button className="border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-8 py-3 rounded-lg font-medium transition">
                     View Offers
                  </button>
               </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
               <div className="bg-neutral-900 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-emerald-400 text-sm font-medium uppercase tracking-wider">Unread Notifications</h3>
                     <span className="text-2xl opacity-80">📬</span>
                  </div>
                  <p className="text-4xl font-bold text-white">{unreadCount}</p>
               </div>

               <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-emerald-500/40 transition">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-emerald-400 text-sm font-medium uppercase tracking-wider">Active Orders</h3>
                     <span className="text-2xl opacity-80">📦</span>
                  </div>
                  <p className="text-4xl font-bold text-white">3</p>
               </div>

               <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-emerald-500/40 transition">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-emerald-400 text-sm font-medium uppercase tracking-wider">Available Offers</h3>
                     <span className="text-2xl opacity-80">🎉</span>
                  </div>
                  <p className="text-4xl font-bold text-white">12</p>
               </div>
            </div>

            {/* Products Section */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
               <h3 className="text-2xl font-bold text-white mb-6">Featured Products</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                     <div
                        key={i}
                        className="group bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-emerald-500 transition-all cursor-pointer"
                     >
                        <div className="w-full h-32 bg-neutral-950 rounded-lg mb-4 flex items-center justify-center text-5xl border border-neutral-800">
                           📱
                        </div>
                        <h4 className="text-white font-semibold mb-1 text-lg">Product {i}</h4>
                        <p className="text-neutral-400 text-sm mb-4">Short description</p>
                        <div className="flex items-center justify-between">
                           <span className="text-white font-bold text-xl">€99.99</span>
                           <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition font-medium">
                              Add
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Info Footer */}
            <div className="mt-12 text-center">
               <div className="inline-block bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-4">
                  <p className="text-neutral-400 text-sm">
                     <span className="text-emerald-400 font-medium">Try notifications:</span> Go to the{" "}
                     <a href="/test-socket" className="text-emerald-400 hover:underline font-medium">
                        test page
                     </a>{" "}
                     to create notifications and see the system in action
                  </p>
               </div>
            </div>
         </main>
      </div>
   );
}
