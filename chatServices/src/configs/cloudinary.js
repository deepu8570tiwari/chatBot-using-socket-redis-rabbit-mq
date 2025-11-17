import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.NODE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NODE_CLOUDINARY_API_KEY,
  api_secret: process.env.NODE_CLOUDINARY_API_SECRET,
});

export { cloudinary };
