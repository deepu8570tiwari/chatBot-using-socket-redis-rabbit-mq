import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./configs/database.js"
import {connectRedis } from "./configs/redisConnect.js"
import {connectRabbitMq} from './configs/rabbitMQ.js';
import userRouter from './routes/usersRoutes.js';
dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
const port=process.env.NODE_PORT;
app.use("/api/v1", userRouter);
app.listen(port,()=>{
    console.log(`server is running on ${port}`);
    connectDB();
    connectRedis();
    connectRabbitMq();
})