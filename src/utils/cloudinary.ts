import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import env from "../env";

cloudinary.config({
    cloud_name: env.CLOUDINARY_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});


export const upload = multer({ storage: multer.memoryStorage() });


export const uploadToCloudinary = (buffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { upload_preset: "cinema_api" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result?.public_id as string);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};