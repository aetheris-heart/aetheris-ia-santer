// frontend/src/services/user.ts
import api from "./api";
import type { ConnectedUser } from "@/types";

export const UserService = {
  async list(): Promise<ConnectedUser[]> {
    const res = await api.get("/users");
    return res.data;
  },

  async me(): Promise<ConnectedUser> {
    const res = await api.get("/auth/me");
    return res.data;
  },

  async register(data: Partial<ConnectedUser> & { password: string }): Promise<ConnectedUser> {
    const res = await api.post("/auth/register", data);
    return res.data;
  },
};
