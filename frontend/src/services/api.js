import axios from "axios";

const API = axios.create({ baseURL: "/api" });

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("fc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Products ──────────────────────────────────────────────────────────────────
export const searchProducts = (query) =>
  API.get(`/products/search?q=${encodeURIComponent(query)}`);

// Smart analyze — uses live endpoint for SerpAPI products, DB endpoint for mock
export const analyzeProduct = (id, product, allProducts) => {
  if (id && String(id).startsWith("serp_")) {
    return API.post("/products/analyze-live", { product, allProducts });
  }
  return API.get(`/products/analyze/${id}`);
};

export const getStats = () => API.get("/products/stats");
export const getCategories = () => API.get("/products/categories");

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginUser = (email, password) =>
  API.post("/auth/login", { email, password });

export const registerUser = (name, email, password) =>
  API.post("/auth/register", { name, email, password });

export const getMe = (token) =>
  axios.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

// ── Favourites ────────────────────────────────────────────────────────────────
export const saveProduct = (productId) =>
  API.post("/auth/save-product", { productId });

export const getSavedProducts = () =>
  API.get("/auth/saved-products");