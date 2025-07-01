// Import Cloudinary SDK
import { v2 as cloudinary } from "cloudinary";

// Node's built-in file system to clean up local uploads
import fs from "fs";

// Load environment variables

// first config it 
// Cloudinary Configuration
cloudinary.config({
     cloud_name: process.env.CLOUDNAME, // Your Cloudinary cloud name
     api_key: process.env.CLOUDAPIKEY, // Your API key
     api_secret: process.env.CLOUDSECRET, // Your API secret
});

// Upload function — uploads a file and deletes local copy
const uploadcloud = async function (path) {
     try {
          if (!path) {
               return null;
          }

          // Upload file from local path to Cloudinary
          //in res entire object is returned
          //it takes time to upload to await
          const res = await cloudinary.uploader.upload(path, {
               resource_type: "auto", // Automatically detect file type (image, video, etc.)
          });

          console.log("✅ Cloudinary upload successful:", res.url);

          // Delete local temp file after successful upload
          if (fs.existsSync(path)) {
               fs.unlinkSync(path);
          }

          return res; // Cloudinary returns full metadata including .url
     } catch (error) {
          console.log("❌ Cloudinary upload failed:", error.message);

          // Still clean up local file if it exists
          if (fs.existsSync(path)) {
               fs.unlinkSync(path);
          }

          return null;
     }
};

export { uploadcloud };
