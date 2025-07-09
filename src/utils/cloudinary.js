import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_NAME,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded successfully
    console.log(
      "file has been uplaoded successfully on cloudinary",
      response.url
    );
    return response;
  } catch (error) {
    fs.unlink(localFilePath); // Remove the locally saved temporary file saved as the upload opeartion got failed
    return null;
  }
};

export { uploadOnCloudinary };
