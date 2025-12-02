/* Archivo Node.js para manejar el signaling de WebRTC */
/* servidor Socket.io independiente que escuchará en el puerto 4000 */

/* Archivo Node.js para manejar el signaling de WebRTC */
import { Server } from "socket.io";
import http from "http";

// Railway necesita respuestas en PUERTO 10000 o variable de entorno
const PORT = 10000;

const server = http.createServer((req, res) => {
  console.log(`[HTTP ${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // 🔴 Railway necesita respuestas RÁPIDAS y en el formato correcto
  try {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    
    const response = JSON.stringify({ 
      status: "OK",
      service: "WebRTC Signaling",
      timestamp: new Date().toISOString()
    });
    
    res.end(response);
    
  } catch (error) {
    console.error('HTTP Error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

// 🔴 Manejar errores del servidor
server.on('error', (error) => {
  console.error('Server error:', error);
});

const io = new Server(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"]
  },
  transports: ["websocket", "polling"],
  // Configuración específica para Railway
  pingTimeout: 60000,
  pingInterval: 25000
});

// ... tu código de eventos Socket.IO
io.on("connection", (socket) => {
  console.log("✅ Nuevo cliente conectado:", socket.id);

  // 👉 El cliente debe enviar meeting_id inmediatamente
  socket.on("join", ({ meetingId }) => {
    if (meetingId) {
      socket.join(meetingId);
      console.log(`👥 Cliente ${socket.id} unido a sala ${meetingId}`);
    }
  });

  socket.on("offer", ({ offer, call_id, meetingId }) => {
    console.log(`📨 Offer recibido en ${meetingId}`);
    socket.to(meetingId).emit("offer", { offer, call_id });
  });

  socket.on("answer", ({ answer, call_id, meetingId }) => {
    console.log(`📨 Answer recibido en ${meetingId}`);
    socket.to(meetingId).emit("answer", { answer, call_id });
  });

  socket.on("ice-candidate", ({ candidate, meetingId }) => {
    socket.to(meetingId).emit("ice-candidate", candidate);
  });

  socket.on("end-call", ({ meetingId }) => {
    console.log(`🔴 End-call recibido en ${meetingId}`);
    socket.to(meetingId).emit("end-call", { meetingId });
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Railway URL: https://skillswap-signaling-production.up.railway.app`);
});

// Mantener el proceso vivo para Railway
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Keep-alive heartbeat`);
}, 15000);