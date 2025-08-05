import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDSECRET,
});

// Uploads file to Cloudinary and deletes local temp file
const uploadcloud = async (path) => {
  if (!path) return null;

  try {
    const result = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
    });

    console.log("✅ Uploaded to Cloudinary:", result.url);

    fs.existsSync(path) && fs.unlinkSync(path);

    return result;
  } catch (error) {
    console.error("❌ Upload failed:", error.message);

    fs.existsSync(path) && fs.unlinkSync(path);

    return null;
  }
};

export { uploadcloud };
