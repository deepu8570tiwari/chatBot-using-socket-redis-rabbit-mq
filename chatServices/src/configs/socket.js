import { Server,Socket } from "socket.io";
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
const userSocketMap={};
export const getReceiverSocketId=(receiverId)=>{
  return userSocketMap[receiverId];
}
// When a user connects
io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  const userId = socket.handshake.query.userId?.toString();

  console.log("Received userId:", userId);

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`user ${userId} mapped to socket ${socket.id}`);
  }

  io.emit("getOnlineUser", Object.keys(userSocketMap));
  if(userId){
    socket.join(userId);
  }
  socket.on("typing",(data)=>{
    console.log(`User ${data.userId} is typing in chat ${data.chatId}`);
    socket.to(data.chatId).emit("userTyping",{
      chatId:data.chatId,
      userId:data.userId,
    })
  })
  socket.on("stopTyping",(data)=>{
    console.log(`User ${data.userId} is stopped typing in chat ${data.chatId}`);
    socket.to(data.chatId).emit("userStoppedTyping",{
      chatId:data.chatId,
      userId:data.userId,
    })
  })
  socket.on("joinChat",(chatId)=>{
    socket.join(chatId);
    console.log(`User ${userId} is Joined chat Room ${chatId}`);
  })

  socket.on("leaveChat",(chatId)=>{
    socket.leave(chatId);
    console.log(`User ${userId} is Left chat Room ${chatId}`);
  })

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUser", Object.keys(userSocketMap));
      console.log(`User ${userId} removed from online list`);
    }
  });
});

export { app, server, io };
