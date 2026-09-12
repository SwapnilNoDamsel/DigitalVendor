import axios from "axios";

export const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("digitalvendor_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
