import { tryCatch } from "../configs/tryCatch.js";
import { Chat } from "../models/chatModels.js";
import { Messages } from "../models/messagesModel.js";
import { uploadToCloudinary } from "../middlewares/upload.js";
import axios from "axios";
import { getReceiverSocketId, io } from "../configs/socket.js";
export const createNewChat = tryCatch(async (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.body;
  // 1. Validate other user ID
  if (!otherUserId) {
    return res.status(400).json({
      status: false,
      message: "Other userId is required"
    });
  }
  // Prevent user from creating chat with themself
  if (otherUserId === userId.toString()) {
    return res.status(400).json({
      status: false,
      message: "You cannot create a chat with yourself"
    });
  }
  // 2. Check if chat already exists
  const existingChat = await Chat.findOne({
    users: { $all: [userId, otherUserId], $size: 2 }
  });

  if (existingChat) {
    return res.status(200).json({
      status: true,
      message: "Chat already exists",
      chatId: existingChat._id
    });
  }

  // 3. Create new chat
  const newChat = await Chat.create({
    users: [userId, otherUserId],
    isGroupChat: false
  });

  return res.status(201).json({
    status: true,
    message: "New chat created",
    chatId: newChat._id
  });
});

export const getAllChats = tryCatch(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(400).json({ status: false, message: "User id is missing" });
  }

  const allChats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

  const chatWithUserData = await Promise.all(
    allChats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());

      const unseenCount = await Messages.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      });

      try {
        const { data } = await axios.get(
          `${process.env.USER_SERVICES}/api/v1/users/${otherUserId}`
        );

        return {
          user: data.user,  // ✅ FIX HERE
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      } catch (error) {
        console.error(error);
        return {
          user: { _id: otherUserId, username: "Unknown User" },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      }
    })
  );

  res.status(200).json({ chats: chatWithUserData });
});



export const sendMessage = tryCatch(async (req, res) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;
  if (!senderId) {
    return res.status(401).json({ status: false, message: "User id is missing" });
  }
  if (!chatId) {
    return res.status(400).json({ status: false, message: "Chat Id is required" });
  }

  // At least text or image required
  if (!text && !req.file) {
    return res.status(400).json({ status: false, message: "Either Image or text is required" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // Check membership
  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  );
  if (!isUserInChat) {
    return res.status(403).json({ message: "Not a participant of this chat" });
  }
  const otherUserId = chat.users.find(
  (id) => id.toString() !== senderId.toString()
);

if (!otherUserId) {
  return res.status(400).json({ message: "Other user not found" });
}
  const receiverSocketId=getReceiverSocketId(otherUserId.toString());
  let isReceiverInChatRoom=false;
  if(receiverSocketId){
    const receiverSocket=io.sockets.sockets.get(receiverSocketId);
    if(receiverSocket && receiverSocket.rooms.has(chatId)){
      isReceiverInChatRoom=true;
    }
  }
  // Build message object
  let messageData = {
    chatId,
    sender: senderId,
    seen: isReceiverInChatRoom,
    seenAt:isReceiverInChatRoom? new Date():undefined,
  };

  // IMAGE UPLOAD ✔
  if (req.file) {
    const uploadedImage = await uploadToCloudinary(req.file.buffer);
    messageData.messageType = "image";
    messageData.text = text || "";
    messageData.fileUrl = uploadedImage.secure_url;
    messageData.filePublicId = uploadedImage.public_id;
  } else {
    messageData.messageType = "text";
    messageData.text = text;
  }

  // Save message
  const savedMessage = await new Messages(messageData).save();

  // Update chat with last message ID (NOT object)
  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: savedMessage._id,
    updatedAt: new Date(),
  });

  io.to(chatId).emit("newMessage",savedMessage);
  if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage",savedMessage)
  }
  const senderSocketId=getReceiverSocketId(senderId.toString())
  if(senderSocketId){
    io.to(senderSocketId).emit("newMessage",savedMessage)
  }
  if(isReceiverInChatRoom && senderSocketId){
    io.to(senderSocketId).emit("messagesSeen",{
      chatId:chatId,
      seenBy:otherUserId,
      messageIds:[savedMessage._id]
    })
  }
  res.status(201).json({
    message: savedMessage,
    sender: senderId,
  });
});
export const getMessageByChatId = tryCatch(async (req, res) => {
  const userId = req.user?._id;
  const { chatId } = req.params;
  if (!userId) {
    return res.status(401).json({ status: false, message: "User ID is missing" });
  }
  if (!chatId) {
    return res.status(400).json({ status: false, message: "Chat ID is required" });
  }
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  // Check membership
  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === userId.toString()
  );
  if (!isUserInChat) {
    return res.status(403).json({ message: "Not a participant of this chat" });
  }

  const messagesToMarkSeen = await Messages.find({ 
    chatId:chatId,
    sender:{$ne:userId},
    seen:false,
  });
  await Messages.updateMany(
    {
      chatId,
      sender: { $ne: userId },
      seen: false,
    },
    {
      seen: true,
      seenAt: new Date(),
    }
  );
  const messages=await Messages.find({chatId}).sort({createdAt:1});
  // Find other user
  const otherUserId = chat.users.find(
    (id) => id.toString() !== userId.toString()
  );
  if (!otherUserId) {
    return res.status(400).json({ message: "No other user in chat" });
  }
  try {
    const { data } = await axios.get(
      `${process.env.USER_SERVICES}/api/v1/users/${otherUserId}`
    );
    if(!otherUserId){
      res.status(400).json({
        message:"No other User"
      })
      return;
    }
    if(messagesToMarkSeen.length >0){
      const otherUserSocketId=getReceiverSocketId(otherUserId.toString());
      if(otherUserSocketId){
        io.to(otherUserSocketId).emit("messageSeen",{
          chatid:chatId,
          seenBy:userId,
          messageIds:messagesToMarkSeen.map((msg)=>msg._id)
        })
      }
    }
    res.json({
      messages,
      user:data,
    })
  } catch (err) {
   console.log(error);
   res.json({
    messages,
    user:{_id:otherUserId, username:"unknow error"}
   })
  }

});
