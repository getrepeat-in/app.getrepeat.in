import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to specific domains in production (e.g., tenant dashboard)
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // When a frontend dashboard connects, it should join a room based on its restaurantId
  socket.on("join_restaurant_room", (restaurantId) => {
    if (restaurantId) {
      socket.join(restaurantId);
      console.log(`Socket ${socket.id} joined room: ${restaurantId}`);
    }
  });

  socket.on("leave_restaurant_room", (restaurantId) => {
    if (restaurantId) {
      socket.leave(restaurantId);
      console.log(`Socket ${socket.id} left room: ${restaurantId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Internal webhook for Next.js to trigger events
// Protect this in production using a secret token if exposed publicly
app.post("/internal/emit", (req, res) => {
  const { event, room, payload } = req.body;

  if (!event || !payload) {
    return res.status(400).json({ error: "Missing event or payload" });
  }

  if (room) {
    // Broadcast to specific room (e.g., a specific restaurant)
    io.to(room).emit(event, payload);
    console.log(`Emitted '${event}' to room '${room}'`);
  } else {
    // Broadcast to all (use sparingly)
    io.emit(event, payload);
    console.log(`Emitted '${event}' globally`);
  }

  res.status(200).json({ success: true });
});

const PORT = process.env.SOCKET_PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Realtime Socket Server running on port ${PORT}`);
});
