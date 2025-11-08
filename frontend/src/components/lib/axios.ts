import axios, { AxiosError } from "axios";

// 🌍 Définition dynamique du backend (priorité à .env)
const BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

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
// ⚙️ Configuration de l’instance Axios principale
// ======================================================
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // ⏱️ 60 secondes (Aetheris peut analyser longuement)
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ======================================================
// 🚀 Intercepteur : Ajout automatique du token
// ======================================================
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ======================================================
// 🧩 Intercepteur : Gestion centralisée des erreurs
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
