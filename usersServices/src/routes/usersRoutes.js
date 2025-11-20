import express from "express";
import { LoginUser,verifyUser,profile,getAllusers,getuserById, updateUsername } from "../controllers/userController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
const router= express.Router();
router.post('/login',LoginUser)
router.post("/verify",verifyUser);
router.get("/me",isAuth,profile);
router.get("/users/all-users",isAuth,getAllusers);
router.get("/users/:id",getuserById);
router.post("/users/update",isAuth,updateUsername)
export default router;