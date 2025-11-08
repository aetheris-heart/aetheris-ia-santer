import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

// Icônes
import { FaHeartbeat, FaBrain, FaLungs, FaUserMd, FaPlus } from "react-icons/fa";

interface Specialite {
  id: number;
  nom: string;
  description?: string;
  icone?: string;
  couleur?: string;
}

const SpecialitesList: React.FC = () => {
  const { token } = useUser();
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const navigate = useNavigate();

  const fetchSpecialites = async () => {
    try {
      const res = await api.get("/specialites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpecialites(res.data);
    } catch {
      toast.error("❌ Impossible de charger les spécialités");
    }
  };

  useEffect(() => {
    fetchSpecialites();
  }, [token]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-600">🏥 Spécialités Médicales</h1>
        <button
          onClick={() => navigate("/specialites/ajouter")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          <FaPlus /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {specialites.map((s) => (
          <motion.div
            key={s.id}
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow cursor-pointer"
            onClick={() => navigate(`/specialites/${s.id}`)}
          >
            <div className="text-4xl mb-2">{s.icone || "🩺"}</div>
            <h2 className="text-xl font-bold" style={{ color: s.couleur || "#4f46e5" }}>
              {s.nom}
            </h2>
            <p className="text-gray-500 text-sm line-clamp-2">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SpecialitesList;
