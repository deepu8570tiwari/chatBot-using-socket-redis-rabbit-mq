import multer from "multer";
import { cloudinary } from "../configs/cloudinary.js";
import streamifier from "streamifier";

// Use memory storage so file stays in buffer
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // max 10 MB
  },
});

// Upload buffer directly to Cloudinary
export const uploadToCloudinary = (fileBuffer, folder = "chatFiles") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",  
        width: 300,         // ⬅ Resize
        height: 300,
        crop: "fill",
        quality: "auto", 
        // (auto = supports images, videos, pdf, docs automatically)
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
