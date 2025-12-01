/* Archivo Node.js para manejar el signaling de WebRTC */
/* servidor Socket.io independiente que escuchará en el puerto 4000 */

/* Archivo Node.js para manejar el signaling de WebRTC */
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// IMPORTANTE: Railway puede usar un proxy, necesitamos trust proxy
app.set('trust proxy', 1);

// Rutas de health check
app.get("/", (req, res) => {
  res.json({ 
    message: "WebRTC Signaling Server",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "WebRTC Signaling Server"
  });
});

// Configuración crucial para Railway
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Configuración para Railway/Heroku
  transports: ["websocket", "polling"],
  allowEIO3: true,
  // Aumentar timeouts para Railway
  pingTimeout: 60000,
  pingInterval: 25000,
  // Configuración de proxy
  cookie: {
    name: "io",
    path: "/",
    httpOnly: true,
    sameSite: "lax"
  }
});

io.on("connection", (socket) => {
  console.log("✅ Nuevo cliente conectado:", socket.id);

  socket.on("offer", (data) => {
    console.log("📨 Offer recibido, haciendo broadcast...");
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("📨 Answer recibido, haciendo broadcast...");
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    console.log("📨 ICE candidate recibido, reenviando...");
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("end-call", (data) => {
    console.log("🔴 End-call recibido, haciendo broadcast...", data);
    socket.broadcast.emit("end-call", data);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Cliente desconectado:", socket.id, " Razón: ",reason);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor WebRTC corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: https://skillswap-signaling.up.railway.app`);
  console.log(`🩺 Health: https://skillswap-signaling.up.railway.app/health`);
});