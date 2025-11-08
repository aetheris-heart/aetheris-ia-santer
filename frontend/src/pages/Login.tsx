import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthAPI } from "@/services/auth";
import { setAccessToken } from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, setToken, token, loading } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🚀 Si déjà connecté, on redirige vers /dashboard
  useEffect(() => {
    if (!loading && token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, token, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await AuthAPI.login(email, password);
      const token = res.data.access_token;

      if (!token) throw new Error("Aucun access_token reçu");

      // ✅ Sauvegarde du token
      setAccessToken(token);
      setToken(token);

      // ✅ Si le backend renvoie user → setUser direct
      if (res.data.user) {
        setUser(res.data.user);
      } else {
        // Sinon on rafraîchit avec /auth/me
        const me = await AuthAPI.me();
        setUser(me.data);
      }

      toast.success("Connexion réussie !");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("[login-json] error:", err);
      setAccessToken(null);
      setToken(null);
      setUser(null);

      const msg = err?.response?.data?.detail || err?.message || "Erreur de connexion";
      toast.error(`Connexion échouée : ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-500 dark:from-gray-900 dark:to-gray-800">
      <form
        onSubmit={handleLogin}
        className="bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          🔐 Connexion à Aetheris
        </h2>

        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
};

export default Login;
