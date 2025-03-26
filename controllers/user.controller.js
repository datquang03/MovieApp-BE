import asyncHandler from "express-async-handler";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middlewares/auth.js";

// @desc register a new user
// @route POST /api/users
// @access Public

// register user
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, image } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(400);
      throw new Error("User already exist");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      image,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//@access Private
//update user
const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, image, email } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.fullName = fullName || user.fullName;
      user.image = image || user.image;
      user.email = email || user.email;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        image: updatedUser.image,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//delete user
const deleteUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (user.isAdmin) {
        return res.status(400).json({ message: "Admin user can't be deleted" });
      }

      await User.findByIdAndDelete(req.user._id); // Sử dụng findByIdAndDelete
      res.status(200).json({ message: "Delete user successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "User not found" });
  }
});

// change user password
const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({ message: "Change password successfully" });
    } else {
      res.status(401).json({ message: "Old password is incorrect" });
    }
  } catch (error) {
    res.status(400).json({ message: "User not found" });
  }
});

// get liked movies
const getLikedMovie = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("likedMovies");
    if (user) res.status(200).json(user.likedMovies);
    else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error getting liked movies" });
  }
});

// add like movies
const addLikedMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (user.likedMovies.includes(movieId)) {
        return res.status(400).json({ message: "Movie is already liked" });
      }
      user.likedMovies.push(movieId);
      await user.save();
      res.status(200).json(user.likedMovies);
    } else {
      res.status(404).json({ message: "Movie not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// remove like movies
const deleteLikedMovie = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.likedMovies = [];
      await user.save();
      res.status(200).json({ message: "All liked movie removed successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error removing movie" });
  }
});

// --- ADMIN CONTROLLER --- //
// get all users
const getUsers = asyncHandler(async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: "Error getting users" });
  }
});
// delete user
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.isAdmin) {
        return res.status(400).json({ message: "Admin user can't be deleted" });
      }
      await User.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "Delete user successfully" });
    }
  } catch (error) {
    res.status(400).json({ message: "User not found" });
  }
});

export {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
  changeUserPassword,
  getLikedMovie,
  addLikedMovie,
  deleteLikedMovie,
  getUsers,
  deleteUser,
};
