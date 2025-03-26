import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { connectDB } from "./config/db.js";
import userRoute from "./routes/users.router.js";
import movieRoute from "./routes/movies.router.js";
import categoryRoute from "./routes/categories.router.js";
import messageRoute from "./routes/messages.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import fs from "fs"; // Thêm fs để tạo thư mục

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
dotenv.config();
const app = express();

// Connect DB
connectDB();
app.use(cors());
app.use(express.json());

// Middleware xử lý lỗi
app.use(errorHandler);

// Tạo thư mục uploads/ nếu chưa tồn tại (chỉ cho cục bộ)
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dùng /tmp/uploads/ trên Vercel nếu cần
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Định tuyến API
app.get("/", (req, res) => {
  res.send("API is running!");
});
app.use("/api/users", userRoute);
app.use("/api/movies", movieRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/messages", messageRoute);

// API Upload Ảnh
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const image = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.json({ image });
});

// Serve ảnh từ thư mục uploads/
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Export app cho Vercel
export default app; // Thay vì server.listen()
