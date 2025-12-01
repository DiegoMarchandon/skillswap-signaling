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

  socket.on("offer", (data) => {
    console.log("📨 Offer recibido, haciendo broadcast…");
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("📨 Answer recibido, haciendo broadcast…");
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    console.log("📨 ICE candidate recibido, reenviando…");
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("end-call", (data) => {
    console.log("🔴 End-call recibido, de:", socket.id);
    socket.broadcast.emit("end-call", data);
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