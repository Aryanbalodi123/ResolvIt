import { v2 as cloudinary } from 'cloudinary';
import "../config/env.js";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

cloudinary.config({
  cloud_name: getRequiredEnv("CLOUDINARY_NAME"),
  api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
  api_secret: getRequiredEnv("CLOUDINARY_API_SECRET"),
});

/**
 * Uploads a base64 encoded image to Cloudinary.
 * @param {string} base64Str - The base64 data URI (e.g., 'data:image/jpeg;base64,...')
 * @param {string} folder - Cloudinary folder where the image should be stored.
 * @returns {Promise<string|null>} - The secure URL of the uploaded image, or null if failed.
 */
export async function uploadImage(base64Str, folder = "complaint_us/uploads") {
  if (!base64Str) return null;
  
  try {
    const result = await cloudinary.uploader.upload(base64Str, {
      folder,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error("[cloudinary] Error uploading image:", error.message);
    return null;
  }
}
