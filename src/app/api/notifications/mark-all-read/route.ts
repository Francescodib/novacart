import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSocketInstance } from "@/lib/socket-server";

// PUT /api/notifications/mark-all-read
export async function PUT(request: NextRequest) {
   try {
      // Verifica autenticazione
      const session = await auth();

      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Non autenticato. Effettua il login." },
            { status: 401 }
         );
      }

      const userId = session.user.id;

      // Aggiorna tutte le notifiche non lette
      const result = await prisma.notification.updateMany({
         where: {
            userId: userId,
            read: false,
         },
         data: {
            read: true,
         },
      });

      // 🔥 Emetti evento WebSocket per sincronizzare tutte le tab
      const io = getSocketInstance();
      if (io) {
         const roomName = `user:${userId}`;
         io.to(roomName).emit("notifications:all-read", { userId });
         console.log(`📢 Tutte le notifiche segnate come lette per user ${userId} via WebSocket`);
      }

      return NextResponse.json({
         message: "Tutte le notifiche segnate come lette",
         count: result.count,
      });
   } catch (error) {
      console.error("Errore PUT /api/notifications/mark-all-read:", error);
      return NextResponse.json(
         { error: "Errore del server" },
         { status: 500 }
      );
   }
}