import { publishToQueue } from "../configs/rabbitMQ.js";
import { redisClient } from "../configs/redisConnect.js";
import { tryCatch } from "../configs/tryCatch.js";

export const LoginUser=tryCatch(async(req,res)=>{
    const {email}=req.body;
    const rateLimiteKey=`otp:ratelimit:${email}`;
    const rateLimit= await redisClient.get(rateLimiteKey);
    if(rateLimit){
        res.status(429).json({message:"Too many request. Please wait before requesting new"});
        return;
    }
    const otp= Math.floor(100000+Math.random()*900000).toString();
    const optkey=`otp:${email}`;
    await redisClient.set(optkey, otp,{
        EX:300
    });
    await redisClient.set(rateLimiteKey,"true",{
        EX:60
    })
    const message={
        to:email,
        subject:"Your OTP Code",
        body:`Your OTP is ${otp}. its valid for 5 Minutes`
    }
    await publishToQueue("send-otp",message);
    res.status(200).json({message:"OTP Sent Successfully"});
})