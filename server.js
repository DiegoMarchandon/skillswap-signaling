// server.js  (Render - WebRTC signaling)
import { Server } from "socket.io";
import http from "http";

// Render setea process.env.PORT, y 10000 sirve para desarrollo local
const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  console.log(`[HTTP ${new Date().toISOString()}] ${req.method} ${req.url}`);

  try {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    });

    res.end(
      JSON.stringify({
        status: "OK",
        service: "WebRTC Signaling",
        timestamp: new Date().toISOString(),
        url: "https://skillswap-signaling.onrender.com",
      })
    );
  } catch (error) {
    console.error("HTTP Error:", error);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

// Manejar errores del servidor HTTP
server.on("error", (error) => {
  console.error("Server error:", error);
});

const io = new Server(server, {
  cors: {
    origin: "*", // si después querés, lo restringimos a tus dominios
    methods: ["GET", "POST", "OPTIONS"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ====================== SOCKET.IO ======================
io.on("connection", (socket) => {
  console.log("✅ Nuevo cliente conectado:", socket.id);

  // El cliente se une a la sala de la meeting
  socket.on("join", ({ meetingId }) => {
    if (!meetingId) return;
    socket.join(meetingId);
    console.log(`👥 Cliente ${socket.id} unido a sala ${meetingId}`);
  });

  socket.on("offer", ({ offer, call_id, meetingId }) => {
    if (!meetingId) {
      console.warn("Offer sin meetingId, ignorando");
      return;
    }
    console.log(`📨 Offer recibido en sala ${meetingId} (call_id=${call_id})`);
    socket.to(meetingId).emit("offer", { offer, call_id, meetingId });
  });

  socket.on("answer", ({ answer, call_id, meetingId }) => {
    if (!meetingId) {
      console.warn("Answer sin meetingId, ignorando");
      return;
    }
    console.log(`📨 Answer recibido en sala ${meetingId} (call_id=${call_id})`);
    socket.to(meetingId).emit("answer", { answer, call_id, meetingId });
  });

  socket.on("ice-candidate", ({ candidate, meetingId }) => {
    if (!meetingId) {
      console.warn("ICE candidate sin meetingId, ignorando");
      return;
    }
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

// Levantar servidor en Render
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log("🌐 Public URL: https://skillswap-signaling.onrender.com");
});

// Mantener el proceso vivo en logs (útil para Render)
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Server alive`);
}, 30000);