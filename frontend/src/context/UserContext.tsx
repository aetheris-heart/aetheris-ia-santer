import React, { createContext, useContext, useEffect, useState } from "react";
import api, { getAccessToken, setAccessToken } from "@/components/lib/axios";

// =============================
// Types
// =============================
export interface Specialite {
  id: number;
  nom: string;
  couleur?: string;
  icone?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConnectedUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  specialite?: string | Specialite | null; // ✅ accepte string ou objet
  photo_url?: string;
}

type UserContextType = {
  user: ConnectedUser | null;
  token: string | null;
  setUser: (u: ConnectedUser | null) => void;
  setToken: (t: string | null) => void;
  loading: boolean;
};

// =============================
// Contexte
// =============================
const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  loading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ConnectedUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getAccessToken());
  const [loading, setLoading] = useState(true);

  const setToken = (t: string | null) => {
    setTokenState(t);
    setAccessToken(t); // ✅ stocke dans localStorage + configure axios.defaults.headers
  };

  // =============================
  // Bootstrap user au démarrage
  // =============================
  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<ConnectedUser>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }, // ✅ toujours envoyer token
        });
        setUser(res.data);
      } catch (err) {
        console.error("❌ Erreur bootstrap user:", err);
        setUser(null);
        setToken(null); // nettoie aussi axios/localStorage
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]);

  return (
    <UserContext.Provider value={{ user, token, setUser, setToken, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
