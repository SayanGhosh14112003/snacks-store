import Category from "../models/category.model.js";

export const createCategory = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const existing = await Category.findOne({ title });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = new Category({ title });
    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
   const {id}=req.params;
    const {title } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: id,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const getCategories = async (_, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, data:categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data:category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Something went wrong" });
  }
};

