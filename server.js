import { Server } from "socket.io";
import http from "http";

// Render usa el PORT que asigna automáticamente
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
      url: "https://skillswap-signaling.onrender.com"
    });

    res.end(response);
  } catch (error) {
    console.error("HTTP Error:", error);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ====================== SOCKET.IO ======================
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

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log("🌐 Public URL: https://skillswap-signaling.onrender.com");
});

// Mantener el proceso vivo
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Server alive`);
}, 30000);