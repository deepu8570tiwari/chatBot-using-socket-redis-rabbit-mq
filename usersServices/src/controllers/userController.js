import { publishToQueue } from "../configs/rabbitMQ.js";
import { redisClient } from "../configs/redisConnect.js";
import { tryCatch } from "../configs/tryCatch.js";
import { generateToken } from "../middlewares/generateJwtToken.js";
import {User} from '../models/userModel.js'

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
        EX:300
    })
    const message={
        to:email,
        subject:"Your OTP Code",
        body:`Your OTP is ${otp}. its valid for 5 Minutes`
    }
    await publishToQueue("send-otp",message);
    res.status(200).json({message:"OTP Sent Successfully"});
})

export const verifyUser = tryCatch(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ status: false, message: "Email And OTP required" });
    }

    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp) {
        return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    if (storedOtp !== otp) {
        return res.status(400).json({ status: false, message: "Please try with different OTP." });
    }

    await redisClient.del(otpKey);

    let user = await User.findOne({ email });
    if (!user) {
        const username = email.slice(0, 8);
        user = await User.create({ username, email });
        user.save();
    }
    const token = generateToken(user);
    res.status(200).json({ status: true, message: "your login successfully", user, token });
});
export const profile=tryCatch(async(req,res)=>{
    const user=req.user;
    res.status(200).json({status:true, message:"Your profile", user:user})
})
export const getAllusers=tryCatch(async(req,res)=>{
    const users= await User.find();
    res.status(200).json({status:true, message:"All User profile details", user:users});
})
export const getuserById=tryCatch(async(req,res)=>{
    const user= await User.findById(req.params.id);
    res.status(200).json({status:true, message:"Your profile", user:user});
})