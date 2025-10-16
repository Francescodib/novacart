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

      // Verifica ownership: solo il proprietario può eliminare
      if (existingNotification.userId !== session.user.id) {
         return NextResponse.json(
            { error: "Non autorizzato. Non puoi eliminare notifiche di altri utenti." },
            { status: 403 }
         );
      }

      // Elimina la notifica
      await prisma.notification.delete({
         where: { id: notificationId },
      });

      // 🔥 Emetti evento WebSocket per sincronizzare tutte le tab
      const io = getSocketInstance();
      if (io) {
         const roomName = `user:${existingNotification.userId}`;
         io.to(roomName).emit("notification:deleted", { id: notificationId });
         console.log(`📢 Notifica ${notificationId} eliminata via WebSocket`);
      }

      return NextResponse.json({
         message: "Notifica eliminata con successo",
      });
   } catch (error) {
      console.error("Errore DELETE /api/notifications/[id]:", error);
      return NextResponse.json(
         { error: "Errore del server" },
         { status: 500 }
      );
   }
}

// GET /api/notifications/[id] - Ottieni singola notifica
export async function GET(
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

      const notification = await prisma.notification.findUnique({
         where: { id: params.id },
      });

      if (!notification) {
         return NextResponse.json(
            { error: "Notifica non trovata" },
            { status: 404 }
         );
      }

      // Verifica ownership: solo il proprietario può vedere la notifica
      if (notification.userId !== session.user.id) {
         return NextResponse.json(
            { error: "Non autorizzato. Non puoi vedere notifiche di altri utenti." },
            { status: 403 }
         );
      }

      return NextResponse.json({ notification });
   } catch (error) {
      console.error("Errore GET /api/notifications/[id]:", error);
      return NextResponse.json(
         { error: "Errore del server" },
         { status: 500 }
      );
   }
}