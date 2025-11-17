import express from "express";
import dotenv from "dotenv"
import {connectDB} from "./configs/database.js";
import chatRoutes from "./routes/chatRouter.js"
import { app,server } from "./configs/socket.js";
dotenv.config();
app.use(express.json());
app.use("/api/v1",chatRoutes);
server.listen(process.env.NODE_PORT,()=>{
    console.log(`server is running on ${process.env.NODE_PORT}`);
    connectDB();
})