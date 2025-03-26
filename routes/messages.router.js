import express from "express";
import {
  getAllMessagesForAdmin,
  getMessagesById,
  sendMessageById,
} from "../controllers/messages.controller.js";
import { admin, protectRouter } from "../middlewares/auth.js";

const router = express.Router();

// Route gửi tin nhắn
router.post("/:id", protectRouter, sendMessageById);
router.get("/:id", protectRouter, getMessagesById);
router.get("/", protectRouter, admin, getAllMessagesForAdmin);
export default router;
