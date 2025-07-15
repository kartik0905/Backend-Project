import multer from "multer";
import path from "path";
import fs from "fs";

// This file is middleware for uploading on cloudinary

// Absolute path to "public/temp"
const uploadDir = path.resolve("public", "temp");

// Ensure the folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Make sure folder path is valid
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename); // Must return string
  },
});

// Export upload instance (NOT multer itself!)
export const upload = multer({ storage });
