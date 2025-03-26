import User from "../models/users.model.js";
import Message from "../models/messages.model.js";

// Gửi tin nhắn với receiverId từ params
const sendMessageById = async (req, res) => {
  try {
    const { messageContent } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      receiverId,
      message: messageContent,
    });

    await newMessage.save();

    req.io.emit("receive_message", newMessage);

    return res.status(200).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error sending message", error });
  }
};

// Lấy tin nhắn giữa người dùng hiện tại và một user cụ thể
const getMessagesById = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullName image")
      .populate("receiverId", "fullName image");

    return res.status(200).json({
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error retrieving messages", error });
  }
};

// Lấy tất cả tin nhắn của admin với nhiều user
const getAllMessagesForAdmin = async (req, res) => {
  try {
    const adminId = req.user._id; // ID của admin (đã qua protectRouter và admin middleware)

    // Lấy tất cả tin nhắn mà admin là sender hoặc receiver
    const messages = await Message.find({
      $or: [
        { senderId: adminId }, // Admin gửi cho bất kỳ ai
        { receiverId: adminId }, // Bất kỳ ai gửi cho admin
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullName image")
      .populate("receiverId", "fullName image");

    return res.status(200).json({
      message: "All messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error retrieving all messages", error });
  }
};

export { sendMessageById, getMessagesById, getAllMessagesForAdmin };
