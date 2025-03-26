import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categories.controller.js";
import { protectRouter, admin } from "../middlewares/auth.js";

const router = express.Router();
// PUBLIC ROUTERS //
router.get("/", getCategories);
// ADMIN CATEGORY ROUTERS //

router.post("/", protectRouter, admin, createCategory);
router.put("/:id", protectRouter, admin, updateCategory);
router.delete("/:id", protectRouter, admin, deleteCategory);

export default router;
