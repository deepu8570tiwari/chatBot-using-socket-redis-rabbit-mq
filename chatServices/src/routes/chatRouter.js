import express from "express";
const router=express.Router();
import {createNewChat, getAllChats, getMessageByChatId, sendMessage} from "../controllers/chatController.js"
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/upload.js";
router.post("/chat/create-chat",isAuth,createNewChat)
router.get("/chat/all", isAuth, getAllChats);
router.post("/chat/message", isAuth, upload.single("imageFile"), sendMessage);
router.get("/chat/message/:chatId", isAuth, getMessageByChatId);
export default router