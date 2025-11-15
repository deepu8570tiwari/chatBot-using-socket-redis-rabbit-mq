import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Event listeners
redisClient.on("connect", () => {
  console.log(" Connected to Redis successfully!");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Important: Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("❌ Redis failed to connect:", error);
  }
};
