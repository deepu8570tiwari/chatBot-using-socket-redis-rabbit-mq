import { tryCatch } from "../configs/tryCatch.js";
import { Chat } from "../models/chatModels.js";
export const createNewChat=tryCatch(async(req,res)=>{
    const userId=req.user._id;
    const {otherUserId}=req.body;
    if(!otherUserId){
        res.status(404).json({status:false, message:"User Id is missing"});
        return;
    }
    const existingChat=await Chat.findOne({
        users:{$all:[userId,otherUserId],$size:2}
    });
    if(existingChat){
        res.status(200).json({message:"chat Already existing",chatId:existingChat._id});
        return;
    }
    const newChat=await Chat.create({
        users:[userId,otherUserId],
    })
    res.status(201).json({message:"New Chat created",chatId:newChat._id});
})
export const getAllChats=tryCatch(async(req,res)=>{
    const userId=req.user?._id;
    if(!userId){
        res.status(400).json({status:false, message:"User id is missing"});
    }
    const AllChats=await Chat.find({userId}).sort({updatedAt:-1});

})