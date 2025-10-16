import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSocketInstance } from "@/lib/socket-server";


// DELETE /api/notifications/[id]
export async function DELETE(
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

      // Verify ownership: only the owner can delete
      if (existingNotification.userId !== session.user.id) {
         return NextResponse.json(
            { error: "Not authorized. You cannot delete other users' notifications." },
            { status: 403 }
         );
      }

      // Delete notification
      await prisma.notification.delete({
         where: { id: notificationId },
      });

      // 🔥 Emit WebSocket event to synchronize all tabs
      const io = getSocketInstance();
      if (io) {
         const roomName = `user:${existingNotification.userId}`;
         io.to(roomName).emit("notification:deleted", { id: notificationId });
         console.log(`📢 Notification ${notificationId} deleted via WebSocket`);
      }

      return NextResponse.json({
         message: "Notification deleted successfully",
      });
   } catch (error) {
      console.error("Error DELETE /api/notifications/[id]:", error);
      return NextResponse.json(
         { error: "Server error" },
         { status: 500 }
      );
   }
}

// GET /api/notifications/[id] - Get single notification
export async function GET(
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

      const notification = await prisma.notification.findUnique({
         where: { id: params.id },
      });

      if (!notification) {
         return NextResponse.json(
            { error: "Notification not found" },
            { status: 404 }
         );
      }

      // Verify ownership: only the owner can view the notification
      if (notification.userId !== session.user.id) {
         return NextResponse.json(
            { error: "Not authorized. You cannot view other users' notifications." },
            { status: 403 }
         );
      }

      return NextResponse.json({ notification });
   } catch (error) {
      console.error("Error GET /api/notifications/[id]:", error);
      return NextResponse.json(
         { error: "Server error" },
         { status: 500 }
      );
   }
}
