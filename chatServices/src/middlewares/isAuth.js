import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    // Check if Authorization header exists and starts with 'Bearer '
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please login, no JWT token found" });
    }
    const token = authHeader.split(" ")[1];

    // Verify and decode JWT
    const decoded = jwt.verify(token, process.env.NODE_JWT_TOKEN);
    if (!decoded?.user) {
      return res.status(401).json({ message: "Invalid JWT token" });
    }

    req.user = decoded.user;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }

    return res.status(401).json({ message: "Try login again - JWT error" });
  }
};
