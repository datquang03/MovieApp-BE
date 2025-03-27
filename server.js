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
import { Server } from "socket.io";
import http from "http";

dotenv.config();
const app = express();

// Connect DB
connectDB();
app.use(cors());
app.use(express.json());

// Middleware xử lý lỗi
app.use(errorHandler);

// Cấu hình multer để lưu file vào thư mục uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Lưu vào thư mục uploads/
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Khởi tạo HTTP server và Socket.IO
const server = http.createServer(app);
const io = new Server(server);

// Middleware để gán io vào request
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.json({ imageUrl });
});

// Serve ảnh từ thư mục uploads/
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Lắng nghe kết nối socket
io.on("connection", (socket) => {
  console.log("A user connected");

  // Lắng nghe sự kiện từ client, ví dụ "send_message"
  socket.on("send_message", (message) => {
    console.log("Message received:", message);
    // Phát lại cho tất cả người dùng khác (broadcast)
    socket.broadcast.emit("receive_message", message);
  });

  // Xử lý ngắt kết nối
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
