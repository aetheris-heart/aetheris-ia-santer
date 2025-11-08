import api, { setAccessToken } from "@/components/lib/axios";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: any; // 👈 tu peux remplacer `any` par ton type `ConnectedUser` si dispo
}

export const AuthAPI = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login-json", { email, password }),

  me: () => api.get("/auth/me"),

  logout: () => {
    setAccessToken(null);
  },
};
