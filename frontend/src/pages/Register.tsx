import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/components/lib/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nom: "",
    specialite: "",
    // role: "medecin", // Décommente si ton backend accepte ce champ
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/auth/register", formData);

      toast.success("✅ Inscription réussie ! Vous pouvez vous connecter.", {
        position: "top-right",
        autoClose: 3000,
      });

      navigate("/login");
    } catch (err: any) {
      console.error("❌ Erreur d'inscription :", err);
      setError(err.response?.data?.detail || "Erreur d'inscription. Vérifie les champs.");
      toast.error("❌ Échec de l'inscription.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-center text-green-700 dark:text-green-400 mb-6">
          🩺 Inscription Médecin
        </h2>

        {error && <p className="bg-red-600/80 text-white p-3 rounded mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nom"
            placeholder="Nom complet"
            value={formData.nom}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="email"
            name="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="password"
            name="mot_de_passe"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            name="specialite"
            placeholder="Spécialité médicale"
            value={formData.specialite}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl text-white font-semibold shadow-xl hover:scale-105 active:scale-95 transition"
          >
            {loading ? "Inscription en cours..." : "✅ S'inscrire"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          Déjà un compte ?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 hover:underline cursor-pointer"
          >
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
