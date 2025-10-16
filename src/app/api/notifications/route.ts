import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSocketInstance } from "@/lib/socket-server";

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
   try {
      // 1. Verify authentication
      const session = await auth();

      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Not authenticated. Please log in." },
            { status: 401 }
         );
      }

      const userId = session.user.id;

      // 2. Get query parameters (for pagination)
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = parseInt(searchParams.get("offset") || "0");
      const unreadOnly = searchParams.get("unreadOnly") === "true";

      // 3. Query database
      const notifications = await prisma.notification.findMany({
         where: {
            userId: userId,
            ...(unreadOnly && { read: false }),
         },
         orderBy: {
            createdAt: "desc",
         },
         take: limit,
         skip: offset,
      });

      // 4. Count total (for pagination)
      const total = await prisma.notification.count({
         where: {
            userId: userId,
            ...(unreadOnly && { read: false }),
         },
      });

      return NextResponse.json({
         notifications,
         total,
         limit,
         offset,
      });
   } catch (error) {
      console.error("Error GET /api/notifications:", error);
      return NextResponse.json(
         { error: "Server error" },
         { status: 500 }
      );
   }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
   try {
      // 1. Verify authentication - Only admin/system can create notifications
      const session = await auth();

      // For security, only admins should be able to create notifications for other users
      // For now we accept authenticated users, but in production add role check
      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Not authenticated. Please log in." },
            { status: 401 }
         );
      }

      // 2. Read and validate body
      const body = await request.json();

      const { userId, type, title, message, metadata, actionUrl } = body;

      // Basic validation
      if (!userId || !type || !title || !message) {
         return NextResponse.json(
            { error: "Missing required fields: userId, type, title, message" },
            { status: 400 }
         );
      }

      // 3. Create notification in database
      const notification = await prisma.notification.create({
         data: {
            userId,
            type,
            title,
            message,
            metadata: metadata || null,
            actionUrl: actionUrl || null,
         },
      });

      // 4. Send via WebSocket in real-time!
      const io = getSocketInstance();
      if (io) {
         const roomName = `user:${userId}`;
         io.to(roomName).emit("notification:new", notification);
         console.log(`📨 Notification sent to user ${userId} via WebSocket`);
      } else {
         console.warn("⚠️ Socket.io instance not available");
      }

      // 5. Return created notification
      return NextResponse.json(
         {
            message: "Notification created successfully",
            notification,
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Error POST /api/notifications:", error);
      return NextResponse.json(
         { error: "Server error" },
         { status: 500 }
      );
   }
}
