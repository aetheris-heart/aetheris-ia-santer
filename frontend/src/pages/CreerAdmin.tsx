import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaUserShield } from "react-icons/fa";
import { useUser } from "@/context/UserContext";

const CreerAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useUser(); // ✅ pour récupérer le token d’un admin connecté

  // 🧩 Champs alignés avec ton schéma Pydantic AdminCreate
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "", // ✅ correspond exactement au backend
    specialite: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/admin/creer", formData, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ passage du token admin
          "Content-Type": "application/json",
        },
      });

      toast.success("✅ Administrateur créé avec succès !");
      console.log("Nouvel admin créé :", res.data);
      navigate("/admin/liste"); // ✅ redirection vers la liste
    } catch (error: any) {
      console.error("Erreur création admin:", error);
      if (error.response) {
        toast.error(`❌ ${error.response.data.detail || "Erreur serveur"}`);
      } else if (error.request) {
        toast.error("⚠️ Impossible de joindre le serveur (vérifie le backend)");
      } else {
        toast.error("❌ Erreur inattendue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl bg-gray-900/80 border border-yellow-600 shadow-2xl rounded-2xl p-8"
      >
        {/* --- Titre --- */}
        <div className="text-center mb-6">
          <FaUserShield className="mx-auto text-yellow-500 text-5xl mb-3" />
          <h1 className="text-3xl font-extrabold text-yellow-500">Créer un Administrateur</h1>
          <p className="text-gray-400 text-sm mt-1">
            Remplissez le formulaire ci-dessous pour ajouter un nouvel administrateur.
          </p>
        </div>

        {/* --- Formulaire --- */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
              required
            />
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            type="password"
            name="mot_de_passe" // ✅ cohérent avec le backend
            placeholder="Mot de passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            type="text"
            name="specialite"
            placeholder="Spécialité"
            value={formData.specialite}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {loading ? "⏳ Création en cours..." : "✅ Enregistrer l'administrateur"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreerAdmin;
