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
      // Verifica autenticazione
      const session = await auth();
      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Non autenticato. Effettua il login." },
            { status: 401 }
         );
      }

      const { id: notificationId } = await params;

      // Verifica che la notifica esista
      const existingNotification = await prisma.notification.findUnique({
         where: { id: notificationId },
      });

      if (!existingNotification) {
         return NextResponse.json(
            { error: "Notifica non trovata" },
            { status: 404 }
         );
      }

      // Verifica ownership: solo il proprietario può segnare come letta
      if (existingNotification.userId !== session.user.id) {
         return NextResponse.json(
            { error: "Non autorizzato. Non puoi modificare notifiche di altri utenti." },
            { status: 403 }
         );
      }

      // Aggiorna la notifica
      const notification = await prisma.notification.update({
         where: { id: notificationId },
         data: { read: true },
      });

      // 🔥 Emetti evento WebSocket per sincronizzare tutte le tab
      const io = getSocketInstance();
      if (io) {
         const roomName = `user:${existingNotification.userId}`;
         io.to(roomName).emit("notification:updated", notification);
         console.log(`📢 Notifica ${notificationId} aggiornata via WebSocket`);
      }

      return NextResponse.json({
         message: "Notifica segnata come letta",
         notification,
      });
   } catch (error) {
      console.error("Errore PUT /api/notifications/[id]/mark-read:", error);
      return NextResponse.json(
         { error: "Errore del server" },
         { status: 500 }
      );
   }
}
