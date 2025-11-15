import express from "express";
import { LoginUser,verifyUser,profile,getAllusers,getuserById } from "../controllers/userController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
const router= express.Router();
router.post('/login',LoginUser)
router.post("/verify",verifyUser);
router.get("/me",isAuth,profile);
router.get("/users/all-users",isAuth,getAllusers);
router.get("/users/:id",isAuth,getuserById);
export default router;