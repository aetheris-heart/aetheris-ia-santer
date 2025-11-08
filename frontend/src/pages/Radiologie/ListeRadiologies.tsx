import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { FaPlusCircle, FaEye, FaTrash, FaXRay, FaBrain, FaChartPie } from "react-icons/fa";
import { toast } from "react-toastify";

interface Radiologie {
  id: number;
  patient_id: number;
  type_examen: string;
  fichier_url?: string;
  analyse_ia?: string;
  niveau_risque?: string;
  date_examen: string;
  effectue_par?: string;
}

const ListeRadiologies: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [radiologies, setRadiologies] = useState<Radiologie[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Charger les examens radiologiques
  useEffect(() => {
    if (!token) return;
    api
      .get<Radiologie[]>("/radiologie", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRadiologies(res.data))
      .catch(() => toast.error("❌ Impossible de charger les examens radiologiques"))
      .finally(() => setLoading(false));
  }, [token]);

  // 🔹 Suppression
  const handleDelete = async (id: number) => {
    if (!window.confirm("🗑️ Supprimer cet examen radiologique ?")) return;
    try {
      await api.delete(`/radiologie/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRadiologies((prev) => prev.filter((r) => r.id !== id));
      toast.success("✅ Examen supprimé avec succès");
    } catch {
      toast.error("❌ Erreur lors de la suppression");
    }
  };

  // 🔹 Lecture JSON de l'analyse IA
  const parseAnalyse = (analyse?: string) => {
    if (!analyse) return null;
    try {
      return JSON.parse(analyse);
    } catch {
      return null;
    }
  };

  // 🔹 Couleur du niveau de risque
  const getRiskColor = (niveau?: string) => {
    switch (niveau) {
      case "Critique":
        return "bg-red-600/20 text-red-500";
      case "Élevé":
        return "bg-orange-500/20 text-orange-500";
      case "Modéré":
        return "bg-yellow-400/20 text-yellow-600";
      default:
        return "bg-green-500/20 text-green-600";
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* === HEADER === */}
      <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <FaXRay className="text-blue-500 text-4xl" />
          <span>Radiologie IA — Gestion des examens</span>
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/radiologie/overview")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition"
          >
            <FaChartPie /> Vue d’ensemble
          </button>

          <button
            onClick={() => navigate("/radiologie/ajouter")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105 transition"
          >
            <FaPlusCircle /> Nouvel examen
          </button>
        </div>
      </div>

      {/* === TABLE === */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">⏳ Chargement des examens...</p>
      ) : radiologies.length === 0 ? (
        <p className="text-gray-500 italic text-center">Aucun examen enregistré.</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="overflow-x-auto shadow-xl rounded-2xl border border-white/20 backdrop-blur-lg bg-white/70 dark:bg-gray-900/50"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm uppercase">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Type d’examen</th>
                <th className="p-3 text-left">Analyse IA</th>
                <th className="p-3 text-left">Risque</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {radiologies.map((r, idx) => {
                const analyse = parseAnalyse(r.analyse_ia);
                const resume = analyse?.resume || "Analyse non disponible";
                const anomalie = analyse?.anomalies_detectees?.[0];
                const confiance = analyse?.confiance ? (analyse.confiance * 100).toFixed(0) : null;

                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-white/60 dark:hover:bg-gray-800/60 transition"
                  >
                    <td className="p-3 font-medium text-gray-600">{idx + 1}</td>
                    <td className="p-3 font-semibold text-gray-900 dark:text-gray-100">
                      {r.type_examen}
                    </td>

                    {/* === Colonne Analyse IA === */}
                    <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FaBrain className="text-purple-500" />
                          <span>{resume}</span>
                        </div>
                        {anomalie && (
                          <span className="text-xs italic text-yellow-500">{anomalie}</span>
                        )}
                        {confiance && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Confiance IA : <strong>{confiance}%</strong>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* === Niveau de risque === */}
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${getRiskColor(
                          analyse?.niveau_risque || r.niveau_risque
                        )}`}
                      >
                        {analyse?.niveau_risque || r.niveau_risque || "Normal"}
                      </span>
                    </td>

                    {/* === Date === */}
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                      {new Date(r.date_examen).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>

                    {/* === Actions === */}
                    <td className="p-3 flex justify-center gap-4 text-lg">
                      <button
                        onClick={() => navigate(`/radiologie/${r.id}`)}
                        className="text-blue-500 hover:scale-110 transition"
                        title="Voir le rapport"
                      >
                        <FaEye />
                      </button>

                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-500 hover:scale-110 transition"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default ListeRadiologies;
