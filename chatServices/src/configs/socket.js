import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// When a user connects
io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);
  // Listen for joining room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Listen for new messages
  socket.on("send_message", (message) => {
    io.to(message.chatId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
  socket.on("connect_error", (error) => {
    console.log("❌ Socket connect Error", error);
  });
});

export { app, server, io };
