import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    // upload file to Cloudinary
    console.log("local",localFilePath)
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      folder:"snacks"
    });

    // remove local file after successful upload
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });

    return result.secure_url;
  } catch (error) {
    // ❌ delete local file even if upload fails
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting failed file:", err);
    });

    console.error("Cloudinary upload error:", error);
    throw new Error("Error while uploading to Cloudinary");
  }
};



