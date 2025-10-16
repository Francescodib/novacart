import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSocketInstance } from "@/lib/socket-server";

// GET /api/notifications - Ottiene notifiche dell'utente
export async function GET(request: NextRequest) {
   try {
      // 1. Verifica autenticazione
      const session = await auth();

      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Non autenticato. Effettua il login." },
            { status: 401 }
         );
      }

      const userId = session.user.id;

      // 2. Ottieni parametri query (per paginazione)
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

      // 4. Conta totale (per paginazione)
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
      console.error("Errore GET /api/notifications:", error);
      return NextResponse.json(
         { error: "Errore del server" },
         { status: 500 }
      );
   }
}

// POST /api/notifications - Crea una nuova notifica
export async function POST(request: NextRequest) {
   try {
      // 1. Verifica autenticazione - Solo admin/sistema possono creare notifiche
      const session = await auth();

      // Per sicurezza, solo gli admin dovrebbero poter creare notifiche per altri utenti
      // Per ora accettiamo utenti autenticati, ma in produzione aggiungi check del ruolo
      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Non autenticato. Effettua il login." },
            { status: 401 }
         );
      }

      // 2. Leggi e valida il body
      const body = await request.json();

      const { userId, type, title, message, metadata, actionUrl } = body;

      // Validazione base
      if (!userId || !type || !title || !message) {
         return NextResponse.json(
            { error: "Campi obbligatori mancanti: userId, type, title, message" },
            { status: 400 }
         );
      }

      // 3. Crea la notifica nel database
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

      // 4. Invia via WebSocket in real-time!
      const io = getSocketInstance();
      if (io) {
         const roomName = `user:${userId}`;
         io.to(roomName).emit("notification:new", notification);
         console.log(`📨 Notification sent to user ${userId} via WebSocket`);
      } else {
         console.warn("⚠️ Socket.io instance not available");
      }

      // 5. Ritorna la notifica creata
      return NextResponse.json(
         {
            message: "Notifica creata con successo",
            notification,
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Errore POST /api/notifications:", error);
      return NextResponse.json(
         { error: "Errore del server" },
         { status: 500 }
      );
   }
}