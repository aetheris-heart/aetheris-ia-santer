import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

interface Biologie {
  id: number;
  type_analyse: string;
  categorie: string;
  etat: string;
  date_prelevement: string;
  patient_id: number;
}

const BiologieList: React.FC = () => {
  const { token } = useUser();
  const [biologies, setBiologies] = useState<Biologie[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const fetchBiologies = async () => {
      try {
        const res = await api.get<Biologie[]>("/biologie", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBiologies(res.data);
      } catch {
        toast.error("❌ Impossible de charger les analyses");
      }
    };
    fetchBiologies();
  }, [token]);

  return (
    <motion.div className="p-6 bg-transparent">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">
        🔬 Analyses Biologiques
      </h2>

      <button
        onClick={() => navigate("/biologie/ajouter")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
      >
        ➕ Nouvelle analyse
      </button>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {biologies.map((b) => (
          <motion.div
            key={b.id}
            className="p-4 rounded-xl shadow-lg bg-white/20 dark:bg-gray-800/40 backdrop-blur-lg cursor-pointer"
            onClick={() => navigate(`/biologie/${b.id}`)}
          >
            <h3 className="font-semibold text-lg">{b.type_analyse}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Catégorie : {b.categorie}</p>
            <p className="text-sm">📅 {new Date(b.date_prelevement).toLocaleDateString()}</p>
            <p
              className={`mt-2 font-bold ${
                b.etat === "Validé"
                  ? "text-green-600"
                  : b.etat === "Urgent"
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {b.etat}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BiologieList;
