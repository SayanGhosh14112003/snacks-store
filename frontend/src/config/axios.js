// src/api/axiosConfig.js
import axios from "axios";
import useUserStore from "../store/userStore";
const logout =useUserStore((state)=>state.logout)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // important for cookies
});

// 🔒 Global interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       logout();
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
