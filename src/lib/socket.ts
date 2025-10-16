import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUserId: string | null = null;

export function getSocket(userId: string, token: string): Socket {
   // Se il socket esiste già E l'userId è lo stesso, ritorna quello esistente
   if (socket && currentUserId === userId) {
      return socket;
   }

   // Altrimenti, disconnetti il vecchio socket (se esiste) e creane uno nuovo
   if (socket) {
      socket.disconnect();
      socket = null;
   }

   currentUserId = userId;
   socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
      auth: {
         userId,
         token,
      },
      autoConnect: false, // non connettersi automaticamente
   });

   return socket;
}

export function disconnectSocket() {
   if (socket) {
      socket.disconnect();
      socket = null;
      currentUserId = null;
   }
}