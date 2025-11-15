import express from "express";
const router=express.Router();
import {createNewChat} from "../controllers/chatController.js"
import { isAuth } from "../middlewares/isAuth.js";
router.post("/create-chat",isAuth,createNewChat)
export default router