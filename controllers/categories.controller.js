import Categories from "../models/categories.model.js";
import asyncHandler from "express-async-handler";

// PUBLIC CONTROLLER //
// get all categories
const getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Categories.find();
    if (!categories) {
      res.status(404).json({ message: "Categories not found" });
    } else {
      res.status(200).json(categories);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// create category
const createCategory = asyncHandler(async (req, res) => {
  try {
    const { title } = req.body;
    const existedCategory = await Categories.findOne({ title: req.body.title });
    if (existedCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const category = new Categories({ title });
    // save to the db
    const createdCategory = await category.save();
    res.status(200).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// update category
const updateCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);
    if (category) {
      category.title = req.body.title || category.title;
      const updatedCategory = await category.save();
      res.status(200).json(updatedCategory);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// delete category
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);
    if (category) {
      await Categories.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "Delete category successfully" });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export { getCategories, createCategory, updateCategory, deleteCategory };
