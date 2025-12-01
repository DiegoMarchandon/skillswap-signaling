/* Archivo Node.js para manejar el signaling de WebRTC */
/* servidor Socket.io independiente que escuchará en el puerto 4000 */

/* Archivo Node.js para manejar el signaling de WebRTC */
import { Server } from "socket.io";
import http from "http";

// Servidor HTTP simple - TODO responde 200
const server = http.createServer((req, res) => {
  // Railway necesita respuestas RÁPIDAS y consistentes
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  
  // Todas las rutas responden lo mismo
  const response = { 
    status: "OK",
    service: "WebRTC Signaling Server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
  
  res.end(JSON.stringify(response));
});

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"],
  // Configuración para evitar timeouts
  pingTimeout: 60000,
  pingInterval: 25000
});

io.on("connection", (socket) => {
  console.log("✅ Nuevo cliente conectado:", socket.id);

  socket.on("offer", (data) => {
    console.log("📨 Offer recibido de:", socket.id);
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("📨 Answer recibido de:", socket.id);
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("end-call", (data) => {
    console.log("🔴 End-call recibido de:", socket.id);
    socket.broadcast.emit("end-call", data);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Cliente desconectado:", socket.id, "razón:", reason);
  });
});

// Railway siempre usa 8080
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor WebRTC corriendo en puerto ${PORT}`);
  console.log(`🚀 Listo para conexiones WebSocket`);
  console.log(`🌐 Health check: CUALQUIER ruta HTTP devuelve 200 OK`);
});