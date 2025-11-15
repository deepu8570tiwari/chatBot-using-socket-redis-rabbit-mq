import express from "express";
import dotenv from "dotenv"
import {connectDB} from "./configs/database.js";
import chatRoutes from "./routes/chatRouter.js"
dotenv.config();
const app=express();
app.use(express.json());
app.use("/api/v1",chatRoutes);
app.listen(process.env.NODE_PORT,()=>{
    console.log(`server is running on ${process.env.NODE_PORT}`);
    connectDB();
})