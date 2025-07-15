import dotenv from "dotenv";
import connectDB from "./db/index.js"; // This file is called from db/index file to basically decrease the code in this file which is a good practice
import { app } from "./app.js";

dotenv.config({
  path: ".env", 
});

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
