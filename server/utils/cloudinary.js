import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Configure cloudinary with dummy fallbacks if not provided so the app doesn't crash
// To make it work for real, add CLOUDINARY_URL or CLOUDINARY_NAME/KEY/SECRET to .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyza'
});

/**
 * Uploads a base64 encoded image to Cloudinary.
 * @param {string} base64Str - The base64 data URI (e.g., 'data:image/jpeg;base64,...')
 * @returns {Promise<string|null>} - The secure URL of the uploaded image, or null if failed.
 */
export async function uploadImage(base64Str) {
  if (!base64Str) return null;
  
  try {
    // We mock the upload if API key is the dummy one
    if (process.env.CLOUDINARY_API_KEY === '123456789012345' || !process.env.CLOUDINARY_NAME) {
      console.warn("⚠️ Using dummy Cloudinary credentials. Image will not actually be uploaded.");
      console.warn("Please add CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env.local");
      // Return a dummy image URL so the frontend doesn't break
      return "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
    }

    const result = await cloudinary.uploader.upload(base64Str, {
      folder: "complaint_us/lost_found",
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.error("[cloudinary] Error uploading image:", error.message);
    return null;
  }
}
