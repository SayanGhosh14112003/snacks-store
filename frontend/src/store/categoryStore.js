import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  activeCategory: "All",

  getCategories: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(`${baseURL}/category/get-category`, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        set({ categories: res.data.data });
      } else {
        toast.error("Failed to load categories");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Create a new category
  createCategory: async (title) => {
    try {
      set({ loading: true });
      const res = await axios.post(
        `${baseURL}/category/create-category`,
        { title },
        { withCredentials: true }
      );

      if (res?.data?.success) {
        toast.success("Category created successfully");
        // Refresh categories
        await get().getCategories();
      } else {
        toast.error(res?.data?.message || "Failed to create category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating category");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Delete a category
  deleteCategory: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.delete(
        `${baseURL}/category/delete-category/${id}`,
        { withCredentials: true }
      );

      if (res?.data?.success) {
        toast.success("Category deleted successfully");
        // Remove deleted category from state
        set({
          categories: get().categories.filter((cat) => cat._id !== id),
        });
      } else {
        toast.error(res?.data?.message || "Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting category");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Update a category
  updateCategory: async (id, title) => {
    try {
      set({ loading: true });
      const res = await axios.put(
        `${baseURL}/category/update-category/${id}`,
        { title },
        { withCredentials: true }
      );

      if (res?.data?.success) {
        toast.success("Category updated successfully");
        // Update the category in state
        set({
          categories: get().categories.map((cat) =>
            cat._id === id ? { ...cat, title } : cat
          ),
        });
      } else {
        toast.error(res?.data?.message || "Failed to update category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating category");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Set active category
  setActive: (cat) => {
    set({ activeCategory: cat });
  },
}));

export default useCategoryStore;
