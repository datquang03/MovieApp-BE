import multer from "multer";

const storage = multer.memoryStorage(); // Dùng bộ nhớ thay vì lưu file vào ổ đĩa
const upload = multer({ storage });

export default upload;
