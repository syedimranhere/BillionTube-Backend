import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDSECRET,
});

// Validate Cloudinary configuration
const validateConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Missing Cloudinary configuration. Check environment variables."
    );
  }
};

// Safe file deletion with async/await
const safeDeleteFile = async (filePath) => {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`🗑️ Deleted local file: ${filePath}`);
  } catch (error) {
    // File doesn't exist or can't be deleted - not critical
    console.log(`ℹ️ Could not delete file ${filePath}: ${error.message}`);
  }
};

// Enhanced video upload with better error handling and logging
const uploadvideo = async (filePath, options = {}) => {
  if (!filePath) {
    throw new Error("File path is required for video upload");
  }

  // Validate config before attempting upload
  validateConfig();

  // Check if file exists
  try {
    await fs.access(filePath);
  } catch (error) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Get file size for logging
  const stats = await fs.stat(filePath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(
    `📹 Uploading video: ${path.basename(filePath)} (${fileSizeMB}MB)`
  );

  try {
    const uploadOptions = {
      resource_type: "video",
      folder: options.folder || "billiontube/videos",
      public_id: options.publicId || `video_${Date.now()}`,
      use_filename: options.useFilename ?? true,
      unique_filename: options.uniqueFilename ?? false,
      chunk_size: 20 * 1024 * 1024, // 20MB chunks for faster chunked upload
      eager_async: true, // Run transformations in background
      eager: [
        { streaming_profile: "full_hd", format: "m3u8" }, // Optimized for streaming
      ],
      ...options.additionalOptions,
    };

    // Use regular upload for files under 100MB, upload_large for bigger files
    let result;

    console.log("📦 Using regular upload...");
    result = await cloudinary.uploader.upload(filePath, uploadOptions);

    // Debug: Log the entire result to see what's returned
    console.log("🔍 Full upload result:", JSON.stringify(result, null, 2));

    // Check if we got a valid response
    if (!result || !result.secure_url) {
      throw new Error(
        "Upload completed but no secure URL returned. Check Cloudinary response above."
      );
    }

    console.log(`✅ Video uploaded successfully: ${result.secure_url}`);
    console.log(
      `📊 Video details: ${result.width}x${result.height}, ${result.duration}s, ${result.format}`
    );

    // Clean up local file
    await safeDeleteFile(filePath);

    return {
      success: true,
      data: result,
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
    };
  } catch (error) {
    console.error("❌ Video upload failed:", error.message);

    // Clean up local file even on failure
    await safeDeleteFile(filePath);

    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

// Enhanced image upload
const uploadimages = async (filePath, options = {}) => {
  if (!filePath) {
    throw new Error("File path is required for image upload");
  }

  // Validate config before attempting upload
  validateConfig();

  // Check if file exists
  try {
    await fs.access(filePath);
  } catch (error) {
    throw new Error(`File not found: ${filePath}`);
  }

  console.log(`🖼️ Uploading image: ${path.basename(filePath)}`);

  try {
    const uploadOptions = {
      resource_type: "image",
      folder: options.folder || "billiontube/images",
      public_id: options.publicId || `image_${Date.now()}`,
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" },
        ...(options.transformations || []),
      ],
      use_filename: options.useFilename ?? true,
      unique_filename: options.uniqueFilename ?? false,
      ...options.additionalOptions,
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log(`✅ Image uploaded successfully: ${result.secure_url}`);
    console.log(
      `📊 Image details: ${result.width}x${result.height}, ${result.format}`
    );

    // Clean up local file
    await safeDeleteFile(filePath);

    return {
      success: true,
      data: result,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("❌ Image upload failed:", error.message);

    // Clean up local file even on failure
    await safeDeleteFile(filePath);

    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

// Generic upload function that auto-detects file type
const uploadFile = async (filePath, options = {}) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  const videoExtensions = [
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".mkv",
  ];
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".tiff",
  ];

  if (videoExtensions.includes(fileExtension)) {
    return await uploadvideo(filePath, options);
  } else if (imageExtensions.includes(fileExtension)) {
    return await uploadimages(filePath, options);
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
};

// Batch upload utility
const uploadMultipleFiles = async (filePaths, options = {}) => {
  const results = [];

  for (const filePath of filePaths) {
    try {
      const result = await uploadFile(filePath, options);
      results.push({ filePath, ...result });
    } catch (error) {
      results.push({
        filePath,
        success: false,
        error: error.message,
        data: null,
      });
    }
  }

  return results;
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log(`🗑️ Deleted from Cloudinary: ${publicId}`);
    return { success: true, result };
  } catch (error) {
    console.error(`❌ Failed to delete ${publicId}:`, error.message);
    return { success: false, error: error.message };
  }
};

export {
  uploadvideo,
  uploadimages,
  uploadFile,
  uploadMultipleFiles,
  deleteFromCloudinary,
  validateConfig,
};
