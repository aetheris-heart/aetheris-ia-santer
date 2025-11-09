// frontend/src/services/api.ts
import axios, { AxiosError } from "axios";

// 🌍 Base URL : utilise la variable d’environnement VITE_API_URL ou Render par défaut
const BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") ||
  "https://aetheris-ia-backend.onrender.com"; // ✅ backend Render officiel

// 🔐 Gestion du token d’accès
const ACCESS_KEY = "token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY) || null;
}

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(ACCESS_KEY, token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(ACCESS_KEY);
    delete api.defaults.headers.common["Authorization"];
  }
}

// 🧠 Création de l’instance Axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 🔄 Intercepteur pour attacher automatiquement le token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    if (error.code === "ECONNABORTED") {
      console.warn("⚠️ Délai d’attente dépassé pour la requête (timeout).");
    }

    if (error.response?.status === 401) {
      console.warn("🔒 Jeton expiré — déconnexion automatique.");
      setAccessToken(null);
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    if (!error.response) {
      console.error("🌐 Erreur réseau ou CORS :", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
