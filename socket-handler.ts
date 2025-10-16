import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "./src/lib/db";
import { NotificationType, Prisma } from "./src/generated/prisma";
import jwt from "jsonwebtoken";

// Map to track connected users
// userId → socketId
const connectedUsers = new Map<string, string>();

export function initSocketHandlers(io: SocketIOServer) {
   console.log("🔌 Socket.io handlers initialized");

   io.on("connection", async (socket: Socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      // 1. AUTHENTICATION - Validate JWT
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;

      console.log(`🔍 Auth received - userId: ${userId}, token length: ${token?.length || 0}, token preview: ${token?.substring(0, 20)}...`);

      if (!token) {
         console.log(`❌ Unauthorized connection from ${socket.id}: no token`);
         socket.emit("error", { message: "Missing authentication token" });
         socket.disconnect();
         return;
      }

      if (!userId) {
         console.log(`❌ Unauthorized connection from ${socket.id}: no userId`);
         socket.emit("error", { message: "Missing user ID" });
         socket.disconnect();
         return;
      }

      // Validate JWT token
      try {
         const jwtSecret = process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production";
         const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };

         // Verify that the userId in the token matches the requested one
         if (decoded.userId !== userId) {
            console.log(`❌ Token mismatch from ${socket.id}: token userId=${decoded.userId}, requested userId=${userId}`);
            socket.emit("error", { message: "Invalid token for this user" });
            socket.disconnect();
            return;
         }

         console.log(`✅ JWT verified for user ${userId} (${decoded.email})`);
      } catch (error) {
         console.log(`❌ Invalid JWT from ${socket.id}:`, error instanceof Error ? error.message : "Unknown error");
         socket.emit("error", { message: "Invalid or expired token" });
         socket.disconnect();
         return;
      }

      // 2. JOIN PERSONAL ROOM
      const roomName = `user:${userId}`;
      await socket.join(roomName);
      connectedUsers.set(userId, socket.id);

      console.log(`👤 User ${userId} joined room: ${roomName}`);

      // Send unread notifications to user
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

      // 3. LISTENING EVENTS

      // When client marks a notification as read
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
            socket.emit("error", { message: "Error updating notification" });
         }
      });

      // When client requests all notifications
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
            socket.emit("error", { message: "Error fetching notifications" });
         }
      });

      // 4. DISCONNECTION
      socket.on("disconnect", () => {
         connectedUsers.delete(userId);
         console.log(`❌ User ${userId} disconnected (${socket.id})`);
      });
   });
}

// Helper function to send notification to a specific user
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
