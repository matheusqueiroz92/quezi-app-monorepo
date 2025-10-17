import axios from "axios";

/**
 * Cliente Axios configurado para API Quezi
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Permite cookies
});

/**
 * Adiciona token de autenticação em cada requisição
 */
api.interceptors.request.use((config) => {
  // Token pode vir de cookie ou localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("quezi_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Trata erros globalmente
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redireciona para login se não autenticado
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("quezi_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

