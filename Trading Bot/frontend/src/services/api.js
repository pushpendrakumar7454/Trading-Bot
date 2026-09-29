import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-1-q3r5.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("trading_bot_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        localStorage.removeItem("trading_bot_token");
      }
    }

    return Promise.reject(error);
  }
);

export default api;