import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { connectDB } from "./config/db.js";
import userRoute from "./routes/users.router.js";
import movieRoute from "./routes/movies.router.js";
import categoryRoute from "./routes/categories.router.js";
import messageRoute from "./routes/messages.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
const app = express();

// Connect DB
app.use(
  cors({
    origin: "https://movie-app-fe-alpha.vercel.app", // Domain frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Các method cho phép
    allowedHeaders: ["Content-Type", "Authorization"], // Headers frontend gửi
  })
);
connectDB();
app.use(express.json());

// Middleware xử lý lỗi
app.use(errorHandler);

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình multer (lưu tạm trên /tmp)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp"); // Vercel dùng /tmp cho file tạm
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

// API Upload Ảnh với Cloudinary
app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Export app cho Vercel
export default app;
