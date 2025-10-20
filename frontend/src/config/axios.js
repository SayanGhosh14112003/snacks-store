// src/api/axiosConfig.js
import axios from "axios";
import userStore from "../store/userStore"; // 🔑 import directly, not the hook

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // important for cookies
});

// 🔒 Global interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      userStore.getState().logout(); // 🔑 call logout directly from state
    }
    return Promise.reject(error);
  }
);

export default api;

