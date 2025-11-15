import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (user) => {
  return jwt.sign({user},process.env.NODE_JWT_TOKEN,{expiresIn:"7d"})
};
