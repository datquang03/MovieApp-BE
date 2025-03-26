import express from "express";
import {
  loginUser,
  registerUser,
  updateUserProfile,
  deleteUserProfile,
  changeUserPassword,
  getLikedMovie,
  addLikedMovie,
  deleteLikedMovie,
  getUsers,
  deleteUser,
} from "../controllers/user.controller.js";
import { admin, protectRouter } from "../middlewares/auth.js";

const router = express.Router();

// --- PUBLIC ROUTERS ---
router.post("/", registerUser);
router.post("/login", loginUser);

// --- PRIVATE ROUTERS ---
router.put("/", protectRouter, updateUserProfile);
router.delete("/", protectRouter, deleteUserProfile);
router.put("/password", protectRouter, changeUserPassword);
router.get("/favorites", protectRouter, getLikedMovie);
router.post("/favorites", protectRouter, addLikedMovie);
router.delete("/favorites", protectRouter, deleteLikedMovie);

// --- ADMIN ROUTERS ---
router.get("/", protectRouter, admin, getUsers);
router.delete("/:id", protectRouter, admin, deleteUser);
export default router;
