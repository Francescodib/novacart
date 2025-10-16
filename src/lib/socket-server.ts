import { Server as SocketIOServer } from "socket.io";

// Usa global di Node.js per condividere tra Next.js e custom server
declare global {
   var socketio: SocketIOServer | undefined;
}

export function setSocketInstance(instance: SocketIOServer) {
   global.socketio = instance;
   console.log("✅ Socket.io instance set globally");
}

export function getSocketInstance(): SocketIOServer | null {
   if (!global.socketio) {
      console.warn("⚠️ Socket.io instance not found in global scope");
      return null;
   }
   return global.socketio;
}
