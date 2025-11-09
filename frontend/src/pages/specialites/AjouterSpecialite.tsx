import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";

// Icônes
import { FaHeartbeat, FaBrain, FaLungs, FaUserMd, FaPlusCircle } from "react-icons/fa";

const AjouterSpecialite: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [icone, setIcone] = useState("🩺");
  const [couleur, setCouleur] = useState("#4f46e5");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(
        "/specialites",
        { nom, description, icone, couleur },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Spécialité ajoutée avec succès !");
      navigate("/specialites");
    } catch {
      toast.error("❌ Erreur lors de l'ajout de la spécialité");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-lg mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/30"
    >
      <h1 className="text-2xl font-bold text-indigo-600 mb-6 flex items-center gap-2">
        <FaPlusCircle /> Ajouter une Spécialité
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : Cardiologie"
            required
            className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrire la spécialité..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Icône */}
<div>
  <label
    htmlFor="icone" // ✅ relie le label au select
    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
  >
    Icône
  </label>

  <select
    id="icone" // ✅ correspond exactement au htmlFor
    value={icone}
    onChange={(e) => setIcone(e.target.value)}
    aria-label="Choisir une icône pour la spécialité" // ✅ double sécurité d’accessibilité
    className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-indigo-400 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
  >
    <option value="❤️">❤️ Cardiologie</option>
    <option value="🧠">🧠 Neurologie</option>
    <option value="🌬️">🌬️ Pneumologie</option>
    <option value="🦴">🦴 Orthopédie</option>
    <option value="🩺">🩺 Autre</option>
  </select>
</div>


        {/* Couleur */}
        <div>
          <label className="block text-sm font-medium mb-1">Couleur</label>
          <input
            type="color"
            value={couleur}
            onChange={(e) => setCouleur(e.target.value)}
            className="w-16 h-10 border rounded"
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Ajouter
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate("/specialites")}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg shadow hover:bg-gray-600 transition"
          >
            Annuler
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AjouterSpecialite;
