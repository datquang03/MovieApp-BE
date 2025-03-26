export const errorHandler = (err, req, res, next) => {
  // Nếu status code chưa được thiết lập (trong trường hợp không có lỗi xảy ra)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Trả về status code và message lỗi
  res.status(statusCode);
  res.json({
    message: err.message, // Trả về thông báo lỗi
    // Chỉ hiển thị stack trace khi môi trường không phải "production"
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
