/* Archivo Node.js para manejar el signaling de WebRTC */
import { Server } from "socket.io";
import http from "http";

// Railway: usar PORT de entorno o 10000
const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  console.log(`[HTTP ${new Date().toISOString()}] ${req.method} ${req.url}`);

  try {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    });

    const response = JSON.stringify({
      status: "OK",
      service: "WebRTC Signaling",
      timestamp: new Date().toISOString(),
    });

    res.end(response);
  } catch (error) {
    console.error("HTTP Error:", error);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

// Manejar errores del servidor
server.on("error", (error) => {
  console.error("Server error:", error);
});

const io = new Server(server, {
  cors: {
    origin: "*", // si querés, después lo restringimos
    methods: ["GET", "POST", "OPTIONS"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ====================== SOCKET.IO ======================
io.on("connection", (socket) => {
  console.log("✅ Nuevo cliente conectado:", socket.id);

  // El cliente debe enviar meetingId apenas se conecta
  socket.on("join", ({ meetingId }) => {
    if (!meetingId) return;
    socket.join(meetingId);
    console.log(`👥 Cliente ${socket.id} unido a sala ${meetingId}`);
  });

  socket.on("offer", ({ offer, call_id, meetingId }) => {
    if (!meetingId) return;
    console.log(`📨 Offer recibido en sala ${meetingId}`);
    socket.to(meetingId).emit("offer", { offer, call_id, meetingId });
  });

  socket.on("answer", ({ answer, call_id, meetingId }) => {
    if (!meetingId) return;
    console.log(`📨 Answer recibido en sala ${meetingId}`);
    socket.to(meetingId).emit("answer", { answer, call_id, meetingId });
  });

  socket.on("ice-candidate", ({ candidate, meetingId }) => {
    if (!meetingId) return;
    console.log(`📨 ICE candidate recibido en sala ${meetingId}`);
    socket.to(meetingId).emit("ice-candidate", { candidate, meetingId });
  });

  socket.on("end-call", ({ meetingId }) => {
    if (!meetingId) return;
    console.log(`🔴 End-call recibido en sala ${meetingId}`);
    socket.to(meetingId).emit("end-call", { meetingId });
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

// Levantar servidor
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(
    "🌐 Railway URL: https://skillswap-signaling-production.up.railway.app"
  );
});

// Mantener el proceso vivo para Railway
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Keep-alive heartbeat`);
}, 15000);