import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSocketInstance } from "@/lib/socket-server";

// PUT /api/notifications/[id]/mark-read
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      // Verify authentication
      const session = await auth();
      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Not authenticated. Please log in." },
            { status: 401 }
         );
      }

      const { id: notificationId } = await params;

      // Verify that notification exists
      const existingNotification = await prisma.notification.findUnique({
         where: { id: notificationId },
      });

      if (!existingNotification) {
         return NextResponse.json(
            { error: "Notification not found" },
            { status: 404 }
         );
      }

      // Verify ownership: only the owner can mark as read
      if (existingNotification.userId !== session.user.id) {
         return NextResponse.json(
            { error: "Not authorized. You cannot modify other users' notifications." },
            { status: 403 }
         );
      }

      // Update notification
      const notification = await prisma.notification.update({
         where: { id: notificationId },
         data: { read: true },
      });

      // 🔥 Emit WebSocket event to synchronize all tabs
      const io = getSocketInstance();
      if (io) {
         const roomName = `user:${existingNotification.userId}`;
         io.to(roomName).emit("notification:updated", notification);
         console.log(`📢 Notification ${notificationId} updated via WebSocket`);
      }

      return NextResponse.json({
         message: "Notification marked as read",
         notification,
      });
   } catch (error) {
      console.error("Error PUT /api/notifications/[id]/mark-read:", error);
      return NextResponse.json(
         { error: "Server error" },
         { status: 500 }
      );
   }
}
