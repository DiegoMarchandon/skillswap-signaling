/* Archivo Node.js para manejar el signaling de WebRTC */
/* servidor Socket.io independiente que escuchará en el puerto 4000 */

/* Archivo Node.js para manejar el signaling de WebRTC */
import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors"; // <- NECESITÁS INSTALAR

const app = express();
const server = http.createServer(app);

// 🔴 IMPORTANTE: Configurar CORS para Railway
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

// 🔴 Middleware para Railway
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
// 🔴 Rutas ABSOLUTAMENTE NECESARIAS para Railway
app.get("/", (req, res) => {
  res.status(200).json({
    status: "running",
    service: "WebRTC Signaling Server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT,
    railway: true
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK",
    healthy: true,
    timestamp: new Date().toISOString()
  });
});

// También para el health check interno de Railway
app.get("/railway/health", (req, res) => {
  res.status(200).send("OK");
});

// Manejar OPTIONS para CORS
app.options("*", (req, res) => {
  res.status(200).send();
});

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",               // para la demo, abierto
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

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

  socket.on("disconnect", (reason) => {
    console.log("❌ Cliente desconectado:", socket.id, "razón:", reason);
  });
});

// Arranque
const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor WebRTC corriendo en puerto ${PORT}`);
  console.log(`🌐 Health: https://skillswap-signaling.up.railway.app/health`);
  console.log(`🌐 Home: https://skillswap-signaling.up.railway.app/`);
});