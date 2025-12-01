/* Archivo Node.js para manejar el signaling de WebRTC */
/* servidor Socket.io independiente que escuchará en el puerto 4000 */

/* Archivo Node.js para manejar el signaling de WebRTC */
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.json({ 
    message: "WebRTC Signaling Server",
    status: "running",
    health: "https://" + req.get('host') + "/health"
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "WebRTC Signaling Server" });
});

const io = new Server(server, {
  // 🔓 Para la demo: CORS abierto (si después querés, lo afinamos)
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"], // igual que en el cliente
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

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor de signaling WebRTC corriendo en puerto ${PORT}`);
});