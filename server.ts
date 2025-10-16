import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { initSocketHandlers } from "./socket-handler";
import { setSocketInstance } from "./src/lib/socket-server";


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Inizializza Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
   // Crea server HTTP
   const httpServer = createServer(async (req, res) => {
      try {
         const parsedUrl = parse(req.url!, true);
         await handle(req, res, parsedUrl);
      } catch (err) {
         console.error("Error occurred handling", req.url, err);
         res.statusCode = 500;
         res.end("Internal server error");
      }
   });

   // Inizializza Socket.io
   const io = new SocketIOServer(httpServer, {
      cors: {
         origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
         methods: ["GET", "POST"],
         credentials: true,
      },
   });

   // Inizializza gli handler per Socket.io
   initSocketHandlers(io);

   // Rendi Socket.io accessibile globalmente
   setSocketInstance(io);

   // Avvia il server
   httpServer.listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io is running on the same port`);
   });
});