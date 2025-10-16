"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { useNotifications } from "@/hooks/useNotifications";

export default function TestSocketPage() {
   const [message, setMessage] = useState("");
   const { data: session, status } = useSession();

   // 🎣 Custom Hooks - All logic is encapsulated!
   const { connected } = useSocket({
      userId: session?.user?.id || "",
      token: session?.user?.accessToken || "",
      onConnect: () => showMessage("✅ Connected to WebSocket!", "success"),
      onDisconnect: () => showMessage("❌ Disconnected from WebSocket", "error"),
   });

   const {
      notifications,
      loading,
      unreadCount,
      create,
      fetch: fetchNotifications,
      markAsRead,
      delete: deleteNotification,
   } = useNotifications();

   // Load notifications on mount
   useEffect(() => {
      fetchNotifications();
   }, [fetchNotifications]);

   const showMessage = (msg: string, type: "success" | "error" | "info") => {
      setMessage(msg);
      setTimeout(() => setMessage(""), 4000);
   };

   // 🧪 TEST FUNCTIONS - Much simpler now!

   const createSingleNotification = async (type: string, title: string, msg: string) => {
      if (!session?.user?.id) {
         showMessage("❌ You must be authenticated!", "error");
         return;
      }
      const result = await create(session.user.id, type, title, msg, "/test");
      if (result.success) {
         showMessage("✅ Notification created!", "success");
      } else {
         showMessage(`❌ ${result.error}`, "error");
      }
   };

   const createThreeNotifications = async () => {
      const notifiche = [
         { type: "ORDER_SHIPPED", title: "📦 Order shipped", message: "Your order #12345 is on its way!" },
         { type: "PROMOTION", title: "🎉 20% discount", message: "Take advantage of the discount on all products!" },
         { type: "NEW_OFFER", title: "✨ New offer", message: "Tech products on sale up to 50%" }
      ];

      for (const notif of notifiche) {
         await createSingleNotification(notif.type, notif.title, notif.message);
         await new Promise(r => setTimeout(r, 500));
      }
   };

   const reloadNotifications = async () => {
      await fetchNotifications();
      showMessage(`✅ Notifications reloaded`, "success");
   };

   const markRead = async (id: string) => {
      const result = await markAsRead(id);
      if (result.success) {
         showMessage("✅ Marked as read", "success");
      } else {
         showMessage(`⚠️ ${result.error || "Error"}`, "info");
      }
   };

   const deleteNotif = async (id: string) => {
      await deleteNotification(id);
      showMessage("🗑️ Notification deleted", "success");
   };

   const deleteAll = async () => {
      if (!confirm("Are you sure you want to delete ALL notifications?")) return;

      for (const notif of notifications) {
         await deleteNotif(notif.id);
         await new Promise(r => setTimeout(r, 200));
      }
   };

   // Show loading during session loading
   if (status === "loading") {
      return (
         <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="text-center">
               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
               <p className="text-gray-400">Loading session...</p>
            </div>
         </div>
      );
   }

   // Show message if not authenticated
   if (!session?.user?.id) {
      return (
         <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="text-center max-w-md">
               <h1 className="text-3xl font-bold mb-4">🔒 Access Denied</h1>
               <p className="text-gray-400 mb-6">You must be authenticated to access this page.</p>
               <a
                  href="/auth/login?callbackUrl=/test-socket"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
               >
                  Log In
               </a>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
         <div className="max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 mb-6">
               <h1 className="text-3xl font-bold mb-2">🧪 WebSocket & Notifications API Test</h1>
               <p className="text-gray-300">
                  User ID: <code className="bg-gray-700 px-2 py-1 rounded text-sm">{session.user.id}</code>
               </p>

               {/* Status Badges */}
               <div className="mt-4 flex gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold ${connected ? "bg-green-500" : "bg-red-500"}`}>
                     <span className={`w-3 h-3 rounded-full ${connected ? "bg-white animate-pulse" : "bg-red-300"}`}></span>
                     {connected ? "WebSocket Connected" : "WebSocket Disconnected"}
                  </span>

                  {unreadCount > 0 && (
                     <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white font-semibold">
                        📬 {unreadCount} Unread
                     </span>
                  )}
               </div>

               {/* Message Toast */}
               {message && (
                  <div className="mt-4 bg-blue-900 border-l-4 border-blue-500 p-4 rounded">
                     <p className="text-blue-200">{message}</p>
                  </div>
               )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* COMMAND PANEL */}
               <div className="lg:col-span-1">
                  <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                     <h2 className="text-xl font-bold mb-4">🎮 Test Commands</h2>

                     <div className="space-y-3">
                        <button
                           onClick={() => createSingleNotification("ORDER_SHIPPED", "📦 Test Order", "Test order shipped!")}
                           disabled={loading}
                           className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                        >
                           📦 Create Order Notification
                        </button>

                        <button
                           onClick={() => createSingleNotification("PROMOTION", "🎉 Test Promo", "Test promotion!")}
                           disabled={loading}
                           className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                        >
                           🎉 Create Promo Notification
                        </button>

                        <button
                           onClick={createThreeNotifications}
                           disabled={loading}
                           className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                        >
                           🚀 Create 3 Notifications
                        </button>

                        <div className="border-t border-gray-700 pt-3 mt-3">
                           <button
                              onClick={reloadNotifications}
                              disabled={loading}
                              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                           >
                              🔄 Reload List
                           </button>

                           <button
                              onClick={deleteAll}
                              disabled={loading || notifications.length === 0}
                              className="w-full mt-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                           >
                              🗑️ Delete All
                           </button>
                        </div>
                     </div>

                     {loading && (
                        <div className="mt-4 text-center">
                           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                     )}
                  </div>
               </div>

               {/* NOTIFICATIONS LIST */}
               <div className="lg:col-span-2">
                  <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                     <h2 className="text-xl font-bold mb-4">
                        📬 Notifications ({notifications.length})
                     </h2>

                     {notifications.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                           <p className="text-4xl mb-2">📭</p>
                           <p className="text-lg">No notifications</p>
                           <p className="text-sm">Create a notification to get started!</p>
                        </div>
                     ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                           {notifications.map((notif) => (
                              <div
                                 key={notif.id}
                                 className={`border border-gray-700 rounded-lg p-4 transition hover:shadow-md ${notif.read ? "bg-gray-700 opacity-70" : "bg-gray-800"}`}
                              >
                                 <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                       <div className="flex items-center gap-2 mb-1">
                                          <h3 className="font-bold text-lg">{notif.title}</h3>
                                          {notif.read && (
                                             <span className="text-xs bg-gray-600 px-2 py-1 rounded">Read</span>
                                          )}
                                       </div>
                                       <p className="text-gray-300 mb-2">{notif.message}</p>
                                       <div className="flex gap-2 text-xs text-gray-400">
                                          <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded">{notif.type}</span>
                                          <span>{new Date(notif.createdAt).toLocaleString()}</span>
                                       </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                       {!notif.read && (
                                          <button
                                             onClick={() => markRead(notif.id)}
                                             className="text-green-400 hover:text-green-300 p-2 rounded hover:bg-gray-700 transition"
                                             title="Mark as read"
                                          >
                                             ✓
                                          </button>
                                       )}
                                       <button
                                          onClick={() => deleteNotif(notif.id)}
                                          className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-gray-700 transition"
                                          title="Delete"
                                       >
                                          🗑️
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
