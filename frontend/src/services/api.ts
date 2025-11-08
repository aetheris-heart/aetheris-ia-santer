// frontend/src/services/api.ts
import axios, { AxiosError } from "axios";

const BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
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

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      setAccessToken(null);
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
