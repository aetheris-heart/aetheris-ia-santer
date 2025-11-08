import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { FaEdit, FaTimes } from "react-icons/fa";

const ModifierSpecialite: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [icone, setIcone] = useState("🩺");
  const [couleur, setCouleur] = useState("#4f46e5");

  // 🔄 Charger la spécialité existante
  useEffect(() => {
    const fetchSpecialite = async () => {
      try {
        const res = await api.get(`/specialites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const s = res.data;
        setNom(s.nom);
        setDescription(s.description || "");
        setIcone(s.icone || "🩺");
        setCouleur(s.couleur || "#4f46e5");
      } catch {
        toast.error("❌ Impossible de charger la spécialité");
      }
    };
    fetchSpecialite();
  }, [id, token]);

  // ✏️ Enregistrer la modification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(
        `/specialites/${id}`,
        { nom, description, icone, couleur },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Spécialité modifiée avec succès !");
      navigate("/specialites");
    } catch {
      toast.error("❌ Erreur lors de la modification");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-lg mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/30"
    >
      <h1 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-2">
        <FaEdit /> Modifier Spécialité
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Icône */}
        <div>
          <label className="block text-sm font-medium mb-1">Icône</label>
          <select
            value={icone}
            onChange={(e) => setIcone(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
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
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Enregistrer
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate("/specialites")}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg shadow hover:bg-gray-600 transition flex items-center gap-2 justify-center"
          >
            <FaTimes /> Annuler
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ModifierSpecialite;
