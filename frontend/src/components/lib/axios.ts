import axios, { AxiosError } from "axios";

// 🌍 Base URL dynamique : priorité à .env sinon fallback vers Render Cloud
const BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") ||
  "https://aetheris-ia-backend.onrender.com"; // ✅ Backend Render officiel

// 🔐 Clé utilisée pour stocker le token JWT
const ACCESS_KEY = "token";

// ======================================================
// 🎟️ Gestion du Token d’accès
// ======================================================
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

// ======================================================
// ⚙️ Configuration principale Axios
// ======================================================
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // ⏱️ 60 secondes (analyse IA longue)
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ======================================================
// 🚀 Intercepteur — ajout automatique du token JWT
// ======================================================
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ======================================================
// 🧩 Intercepteur — gestion centralisée des erreurs
// ======================================================
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.code === "ECONNABORTED") {
      console.warn("⚠️ Temps d’attente dépassé (timeout Axios).");
    }

    if (error.response?.status === 401) {
      console.warn("🔒 Jeton expiré ou invalide — déconnexion automatique.");
      setAccessToken(null);
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    if (error.response?.status === 500) {
      console.error("💥 Erreur interne du serveur :", error.response.data);
    }

    if (!error.response) {
      console.error("🌐 Erreur réseau ou CORS :", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
