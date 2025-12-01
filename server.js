/* Archivo Node.js para manejar el signaling de WebRTC */
/* servidor Socket.io independiente que escuchará en el puerto 4000 */

/* Archivo Node.js para manejar el signaling de WebRTC */
import { Server } from "socket.io";
import http from "http";

// Railway necesita respuestas en PUERTO 10000 o variable de entorno
const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  
  // Railway verifica que respondas en menos de 30 segundos
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.end(JSON.stringify({ 
    status: "OK",
    service: "WebRTC Signaling",
    port: PORT,
    railway: true,
    timestamp: new Date().toISOString()
  }));
});

const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket", "polling"]
});

// ... tu código de eventos Socket.IO

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
  console.log(`📡 Ready for WebSocket connections`);
  console.log(`🏗️ Railway URL: https://skillswap-signaling-production.up.railway.app`);
});

// Mantener el proceso vivo para Railway
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Heartbeat - Server alive`);
}, 30000);