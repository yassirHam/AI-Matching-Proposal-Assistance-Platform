import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const validateConfig = () => {
    if (!process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Missing Cloudinary configuration in .env file");
    }
}

try {
    validateConfig();
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true // Always recommended
    });
} catch (error) {
    console.error("Cloudinary configuration failed:", error);
    process.exit(1);
}

export default cloudinary;