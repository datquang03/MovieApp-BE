import express from "express";

import { protectRouter, admin } from "../middlewares/auth.js";
import {
  createMovie,
  createMovieReview,
  deleteAllMovies,
  deleteMovie,
  getMovie,
  getMovies,
  getRandomMovies,
  getTopRatedMovies,
  importMovies,
  updateMovie,
} from "../controllers/movies.controller.js";

const router = express.Router();

// --- PUBLIC ROUTERS ---

router.post("/import", importMovies);
router.get("/", getMovies);
router.get("/:id", getMovie);
router.get("/rated/top", getTopRatedMovies);
router.get("/random/all", getRandomMovies);

// --- PRIVATE ROUTERS ---
router.post("/:id/reviews", protectRouter, createMovieReview);

// --- ADMIN ROUTERS ---
router.put("/:id", protectRouter, admin, updateMovie);
router.delete("/:id", protectRouter, admin, deleteMovie);
router.delete("/", protectRouter, admin, deleteAllMovies);
router.post("/", protectRouter, admin, createMovie);

export default router;
