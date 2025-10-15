import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  getProducts: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(`${baseURL}/product/get-product`, {
        withCredentials: true,
      });
      if (res?.data?.success) {
        set({ products: res.data.data });
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (productData) => {
    try {
      set({ loading: true });
      const res = await axios.post(`${baseURL}/product/create-product`, productData, {
        withCredentials: true,
      });
      if (res?.data?.success) {
        toast.success("Product created successfully");
        set({ products: [...get().products, res.data.data] });
      } else {
        toast.error(res?.data?.message || "Failed to create product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating product");
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, updatedData) => {
    try {
      set({ loading: true });
      const res = await axios.put(`${baseURL}/product/update-product/${id}`, updatedData, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        toast.success("Product updated successfully");

        // Replace product in state with updated product from backend
        const updatedProduct = res.data.data;
        set({
          products: get().products.map((p) =>
            p._id === id ? updatedProduct : p
          ),
        });
      } else {
        toast.error(res?.data?.message || "Failed to update product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating product");
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.delete(`${baseURL}/product/delete-product/${id}`, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        toast.success("Product deleted successfully");
        set({ products: get().products.filter((p) => p._id !== res.data.data) });
      } else {
        toast.error(res?.data?.message || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting product");
    } finally {
      set({ loading: false });
    }
  },
}));

export default useProductStore;
