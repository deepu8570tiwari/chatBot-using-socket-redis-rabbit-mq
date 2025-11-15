import express from "express";
import dotenv from "dotenv";
import { sendOTPConsumer } from "./utils/rabbitMQConsumer.js";
dotenv.config();
const app=express();
const port=process.env.NODE_PORT;
//app.use("app/v1", userRouter);
app.listen(port,()=>{
    console.log(`server is running on ${port}`);
    sendOTPConsumer();
})