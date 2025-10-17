import toast from "react-hot-toast";
import axios from "axios";
import { create } from "zustand";

 const baseURL = import.meta.env.VITE_API_URL || "/api";

const useUserStore = create((set) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  userList: [],
  cart:[],
  // ---------------- AUTH ----------------
  register: async ({ email, name, password, confirmPassword }) => {
    try {
      set({ loading: true });
      const res = await axios.post(
        baseURL + "/auth/register",
        { email, name, password, confirmPassword },
        { withCredentials: true }
      );

      if (res?.data?.success) {
        toast.success("OTP sent to your email");
        return true;
      } else {
        toast.error("Something went wrong");
        return false;
      }
    } catch (err) {
      toast.error("Something went wrong");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  verify: async ({ email, OTP }) => {
    try {
      set({ loading: true });
      const res = await axios.post(
        baseURL + "/auth/verify-email",
        { email, OTP },
        { withCredentials: true }
      );

      if (res?.data?.success) {
        toast.success("Registration successful");
        return true;
      } else {
        toast.error("Verification failed!");
        return false;
      }
    } catch (err) {
      toast.error("Verification failed!");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  login: async ({ email, password }) => {
    try {
      console.log("Hellllllllo")
      set({ loading: true });
      const res = await axios.post(
        baseURL + "/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (res?.data?.success) {
        set({ user: res?.data?.data });
        toast.success("Login successful");
        return true;
      } else {
        toast.error("Login failed!");
        return false;
      }
    } catch (err) {
      toast.error("Login failed!");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ checkingAuth: true });
      const res = await axios.get(baseURL + "/auth/my-details", { withCredentials: true });
      if (res?.data?.success) {
        set({ user: res?.data?.data });
        return true;
      } else {
        set({ user: null });
        return false;
      }
    } catch (err) {
      set({ user: null });
      return false;
    } finally {
      set({ checkingAuth: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      const res = await axios.post(baseURL + "/auth/logout", {}, { withCredentials: true });
      if (res?.data?.success) {
        toast.success("Logout Successfully");
        set({ user: null });
      }
    } catch (err) {
      toast.error("Failed to Logout");
    } finally {
      set({ loading: false });
    }
  },

  // ---------------- USERS ----------------
  getAllUsers: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(baseURL + "/auth/get-all-users", { withCredentials: true });
      if (res?.data?.success) {
        set({ userList: res?.data?.data });
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      set({ loading: false });
    }
  },

  changeRole: async (id, role) => {
    try {
      set({ loading: true });
      const res = await axios.put(baseURL + `/auth/change-role/${id}`, { role }, { withCredentials: true });
      if (res?.data?.success) {
        set((state) => ({
          userList: state?.userList?.map((u) => u?._id === id ? { ...u, role } : u)
        }));
        toast.success("Role updated successfully");
        return true;
      } else {
        toast.error("Failed to update role");
        return false;
      }
    } catch (err) {
      toast.error("Failed to update role");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // ---------------- ADDRESSES ----------------
  addAddress: async ({ phone, location, pincode }) => {
    try {
      set({ loading: true });
      const res = await axios.post(baseURL + "/address/add-address", { phone, location, pincode }, { withCredentials: true });

      if (res?.data?.success) {
        set((state) => ({
          user: {
            ...state.user,
            addresses: [...(state?.user?.addresses || []), res?.data?.data],
          },
        }));
        toast.success("Address added successfully");
      } else {
        toast.error("Failed to add address");
      }
    } catch (err) {
      toast.error("Failed to add address");
    } finally {
      set({ loading: false });
    }
  },

  deleteAddress: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.delete(baseURL + "/address/delete-address/" + id, { withCredentials: true });

      if (res?.data?.success) {
        set((state) => ({
          user: {
            ...state.user,
            addresses: state?.user?.addresses?.filter((addr) => addr?._id !== id),
          },
        }));
        toast.success("Address deleted successfully");
      } else {
        toast.error("Failed to delete address");
      }
    } catch (err) {
      toast.error("Failed to delete address");
    } finally {
      set({ loading: false });
    }
  },

  updateAddress: async ({ addressId, phone, location, pincode }) => {
    try {
      set({ loading: true });
      const res = await axios.put(baseURL + "/address/update-address/" + addressId, { phone, location, pincode }, { withCredentials: true });

      if (res?.data?.success) {
        set((state) => ({
          user: {
            ...state.user,
            addresses: state?.user?.addresses?.map((addr) =>
              addr?._id === addressId ? res?.data?.data : addr
            ),
          },
        }));
        toast.success("Address updated successfully");
      } else {
        toast.error("Failed to update address");
      }
    } catch (err) {
      toast.error("Failed to update address");
    } finally {
      set({ loading: false });
    }
  },

  // ---------------- CART ----------------
  getCart: async()=>{
    try{
      set({loading:true})
      const res=await axios.get(baseURL+'/cart/get-cart',{withCredentials:true});
      if (res?.data?.success) {
        set({cart:[...(res.data.data)]});
      } 
    }
    catch(err){
      console.log(err.message)
      toast.error("Some Products are no longer available"); 
    }
    finally{
      set({loading:false});
    }
  },
  addToCart: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.put(baseURL + "/cart/add-to-cart/" + id, {}, { withCredentials: true });
      if (res?.data?.success) {
        set({cart:[...(res.data.data)]});
        toast.success("Snack added to cart");
      } else {
        toast.error("Failed to add snack to cart");
      }
    } catch (err) {
      toast.error("Failed to add snack to cart");
    } finally {
      set({ loading: false }); // corrected from 'true' to 'false'
    }
  },
  removeFromCart: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.put(baseURL + "/cart/remove-from-cart/" + id, {}, { withCredentials: true });
      if (res?.data?.success) {
        set({cart:[...(res.data.data)]});
        toast.success("Snack removed from cart");
      } else {
        toast.error("Failed to remove snack from cart");
      }
    } catch (err) {
      toast.error("Failed to remove snack from cart");
    } finally {
      set({ loading: false });
    }
  },
  deleteFromCart: async (id) => {
    try {
      set({ loading: true });
      const res = await axios.delete(baseURL + "/cart/remove-product-from-cart/" + id, { withCredentials: true });
      if (res?.data?.success) {
        set({cart:[...(res.data.data)]});
        toast.success("Snack removed from cart");
      } else {
        toast.error("Failed to remove snack from cart");
      }
    } catch (err) {
      toast.error("Failed to remove snack from cart");
    } finally {
      set({ loading: false });
    }
  },
}));

export default useUserStore;