import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "./src/lib/db";
import { NotificationType, Prisma } from "./src/generated/prisma";
import jwt from "jsonwebtoken";

// Mappa per tracciare utenti connessi
// userId → socketId
const connectedUsers = new Map<string, string>();

export function initSocketHandlers(io: SocketIOServer) {
   console.log("🔌 Socket.io handlers initialized");

   io.on("connection", async (socket: Socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      // 1. AUTENTICAZIONE - Valida JWT
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;

      console.log(`🔍 Auth received - userId: ${userId}, token length: ${token?.length || 0}, token preview: ${token?.substring(0, 20)}...`);

      if (!token) {
         console.log(`❌ Unauthorized connection from ${socket.id}: no token`);
         socket.emit("error", { message: "Token di autenticazione mancante" });
         socket.disconnect();
         return;
      }

      if (!userId) {
         console.log(`❌ Unauthorized connection from ${socket.id}: no userId`);
         socket.emit("error", { message: "User ID mancante" });
         socket.disconnect();
         return;
      }

      // Valida il JWT token
      try {
         const jwtSecret = process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production";
         const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };

         // Verifica che l'userId nel token corrisponda a quello richiesto
         if (decoded.userId !== userId) {
            console.log(`❌ Token mismatch from ${socket.id}: token userId=${decoded.userId}, requested userId=${userId}`);
            socket.emit("error", { message: "Token non valido per questo utente" });
            socket.disconnect();
            return;
         }

         console.log(`✅ JWT verified for user ${userId} (${decoded.email})`);
      } catch (error) {
         console.log(`❌ Invalid JWT from ${socket.id}:`, error instanceof Error ? error.message : "Unknown error");
         socket.emit("error", { message: "Token non valido o scaduto" });
         socket.disconnect();
         return;
      }

      // 2. JOIN ROOM PERSONALE
      const roomName = `user:${userId}`;
      await socket.join(roomName);
      connectedUsers.set(userId, socket.id);

      console.log(`👤 User ${userId} joined room: ${roomName}`);

      // Invia notifiche non lette all'utente
      try {
         const unreadNotifications = await prisma.notification.findMany({
            where: {
               userId: userId,
               read: false,
            },
            orderBy: {
               createdAt: "desc",
            },
            take: 10,
         });

         socket.emit("notifications:initial", unreadNotifications);
         console.log(`📬 Sent ${unreadNotifications.length} unread notifications to user ${userId}`);
      } catch (error) {
         console.error("Error fetching notifications:", error);
      }

      // 3. EVENTI IN ASCOLTO

      // Quando il client segna una notifica come letta
      socket.on("notification:mark-read", async (notificationId: string) => {
         try {
            await prisma.notification.update({
               where: { id: notificationId },
               data: { read: true },
            });

            socket.emit("notification:marked-read", { id: notificationId });
            console.log(`✔️ Notification ${notificationId} marked as read`);
         } catch (error) {
            console.error("Error marking notification as read:", error);
            socket.emit("error", { message: "Errore durante l'aggiornamento" });
         }
      });

      // Quando il client richiede tutte le notifiche
      socket.on("notifications:fetch", async ({ limit = 20, offset = 0 }) => {
         try {
            const notifications = await prisma.notification.findMany({
               where: { userId: userId },
               orderBy: { createdAt: "desc" },
               take: limit,
               skip: offset,
            });

            socket.emit("notifications:list", notifications);
         } catch (error) {
            console.error("Error fetching notifications:", error);
            socket.emit("error", { message: "Errore durante il recupero" });
         }
      });

      // 4. DISCONNESSIONE
      socket.on("disconnect", () => {
         connectedUsers.delete(userId);
         console.log(`❌ User ${userId} disconnected (${socket.id})`);
      });
   });
}

// Funzione helper per inviare notifica a un utente specifico
export function sendNotificationToUser(
   io: SocketIOServer,
   userId: string,
   notification: {
      id: string;
      type: NotificationType;
      title: string;
      message: string;
      actionUrl?: string | null;
      metadata?: Prisma.JsonValue;
      createdAt: Date;
   }
) {
   const roomName = `user:${userId}`;
   io.to(roomName).emit("notification:new", notification);
   console.log(`📨 Sent notification to user ${userId} in room ${roomName}`);
}
