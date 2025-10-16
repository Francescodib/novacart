import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSocketInstance } from "@/lib/socket-server";

// PUT /api/notifications/mark-all-read
export async function PUT(request: NextRequest) {
   try {
      // Verify authentication
      const session = await auth();

      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Not authenticated. Please log in." },
            { status: 401 }
         );
      }

      const userId = session.user.id;

      // Update all unread notifications
      const result = await prisma.notification.updateMany({
         where: {
            userId: userId,
            read: false,
         },
         data: {
            read: true,
         },
      });

      // 🔥 Emit WebSocket event to synchronize all tabs
      const io = getSocketInstance();
      if (io) {
         const roomName = `user:${userId}`;
         io.to(roomName).emit("notifications:all-read", { userId });
         console.log(`📢 All notifications marked as read for user ${userId} via WebSocket`);
      }

      return NextResponse.json({
         message: "All notifications marked as read",
         count: result.count,
      });
   } catch (error) {
      console.error("Error PUT /api/notifications/mark-all-read:", error);
      return NextResponse.json(
         { error: "Server error" },
         { status: 500 }
      );
   }
}
