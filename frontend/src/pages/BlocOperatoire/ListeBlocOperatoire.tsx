import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import {
  FaPlusCircle,
  FaUserMd,
  FaTrash,
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaHeartbeat,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface BlocOperatoire {
  id: number;
  patient_id: number;
  type_intervention: string;
  chirurgien: string;
  assistant1?: string;
  assistant2?: string;
  assistant3?: string;
  assistant4?: string;
  date_intervention: string;
  duree?: string;
  compte_rendu?: string;
  statut: string;
}

const ListeBlocOperatoire: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [blocs, setBlocs] = useState<BlocOperatoire[]>([]);
  const [loading, setLoading] = useState(true);

  // 📥 Charger les interventions
  useEffect(() => {
    if (!token) return;
    api
      .get<BlocOperatoire[]>("/bloc-operatoire", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBlocs(res.data))
      .catch(() => toast.error("❌ Impossible de charger les interventions"))
      .finally(() => setLoading(false));
  }, [token]);

  // 🧮 Stats rapides
  const total = blocs.length;
  const enCours = blocs.filter((b) => b.statut === "En cours").length;
  const terminees = blocs.filter((b) => b.statut === "Terminée").length;

  // 🗑️ Supprimer
  const handleDelete = async (id: number) => {
    if (!window.confirm("❌ Supprimer cette intervention ?")) return;
    try {
      await api.delete(`/bloc-operatoire/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlocs((prev) => prev.filter((b) => b.id !== id));
      toast.success("✅ Intervention supprimée");
    } catch {
      toast.error("❌ Échec suppression intervention");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 🏥 En-tête */}
      <div className="flex justify-between items-center mb-10">
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3"
        >
          <FaUserMd className="text-purple-500" />
          Bloc Opératoire
        </motion.h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/bloc-operatoire/ajouter")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition"
        >
          <FaPlusCircle /> Nouvelle intervention
        </motion.button>
      </div>

      {/* 📊 Statistiques en haut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="p-5 rounded-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur shadow"
        >
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <FaHeartbeat className="text-xl" />
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">Total interventions</h2>
          </div>
          <p className="text-2xl font-bold mt-2">{total}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="p-5 rounded-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur shadow"
        >
          <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
            <FaClock className="text-xl" />
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">En cours</h2>
          </div>
          <p className="text-2xl font-bold mt-2">{enCours}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="p-5 rounded-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur shadow"
        >
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <FaCheckCircle className="text-xl" />
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">Terminées</h2>
          </div>
          <p className="text-2xl font-bold mt-2">{terminees}</p>
        </motion.div>
      </div>

      {/* 📋 Tableau principal */}
      {loading ? (
        <p className="text-gray-500">⏳ Chargement des interventions...</p>
      ) : blocs.length === 0 ? (
        <p className="text-gray-500 italic">Aucune intervention enregistrée.</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Intervention</th>
                <th className="p-3 text-left">Chirurgien</th>
                <th className="p-3 text-left">Assistants</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Statut</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blocs.map((b, idx) => (
                <motion.tr
                  key={b.id}
                  whileHover={{ scale: 1.01 }}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-white/40 dark:hover:bg-gray-800/40 transition"
                >
                  <td className="p-3 font-semibold text-gray-700 dark:text-gray-300">{idx + 1}</td>
                  <td className="p-3">{b.patient_id}</td>
                  <td className="p-3">{b.type_intervention}</td>
                  <td className="p-3">{b.chirurgien}</td>
                  <td className="p-3 text-sm">
                    {[b.assistant1, b.assistant2, b.assistant3, b.assistant4]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(b.date_intervention).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        b.statut === "Terminée"
                          ? "bg-green-100 text-green-700"
                          : b.statut === "En cours"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {b.statut}
                    </span>
                  </td>
                  <td className="p-3 flex justify-center gap-4">
                    <button
                      onClick={() => navigate(`/bloc-operatoire/${b.id}`)}
                      className="text-blue-500 hover:scale-125 transition"
                      title="Voir les détails"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/bloc-operatoire/modifier/${b.id}`)}
                      className="text-yellow-500 hover:scale-125 transition"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-red-500 hover:scale-125 transition"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default ListeBlocOperatoire;
