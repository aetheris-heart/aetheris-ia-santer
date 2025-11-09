import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { FaPlusCircle, FaHospitalUser, FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

interface Hospitalisation {
  id: number;
  patient_id: number;
  service: string;
  chambre?: string;
  lit?: string;
  motif?: string;
  observations?: string;
  statut: string;
  date_entree: string;
  date_sortie?: string;
}

const ListeHospitalisations: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [hospitalisations, setHospitalisations] = useState<Hospitalisation[]>([]);
  const [loading, setLoading] = useState(true);

  // 📥 Charger les hospitalisations
  useEffect(() => {
    if (!token) return;
    api
      .get<Hospitalisation[]>("/hospitalisations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHospitalisations(res.data))
      .catch(() => toast.error("❌ Impossible de charger les hospitalisations"))
      .finally(() => setLoading(false));
  }, [token]);

  // 🗑️ Supprimer une hospitalisation
  const handleDelete = async (id: number) => {
    if (!window.confirm("❌ Supprimer cette hospitalisation ?")) return;
    try {
      await api.delete(`/hospitalisations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHospitalisations((prev) => prev.filter((h) => h.id !== id));
      toast.success("✅ Hospitalisation supprimée avec succès");
    } catch {
      toast.error("❌ Échec lors de la suppression");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-transparent backdrop-blur-md">
      {/* 🏥 En-tête */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FaHospitalUser className="text-purple-500" /> Hospitalisations
        </h1>
        <button
          onClick={() => navigate("/hospitalisations/ajouter")}
          title="Ajouter une hospitalisation"
          aria-label="Ajouter une hospitalisation"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105 transition focus:ring-2 focus:ring-green-400"
        >
          <FaPlusCircle aria-hidden="true" /> Nouvelle Hospitalisation
        </button>
      </div>

      {/* 📋 Tableau principal */}
      {loading ? (
        <p className="text-gray-500">⏳ Chargement...</p>
      ) : hospitalisations.length === 0 ? (
        <p className="text-gray-500 italic">Aucune hospitalisation trouvée.</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Patient ID</th>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Chambre</th>
                <th className="p-3 text-left">Lit</th>
                <th className="p-3 text-left">Statut</th>
                <th className="p-3 text-left">Entrée</th>
                <th className="p-3 text-left">Sortie</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitalisations.map((h, idx) => (
                <tr
                  key={h.id}
                  className="border-b border-gray-300 dark:border-gray-700 hover:bg-white/40 dark:hover:bg-gray-800/40 transition"
                >
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{h.patient_id}</td>
                  <td className="p-3">{h.service}</td>
                  <td className="p-3">{h.chambre || "—"}</td>
                  <td className="p-3">{h.lit || "—"}</td>
                  <td className="p-3">{h.statut}</td>
                  <td className="p-3">{new Date(h.date_entree).toLocaleString()}</td>
                  <td className="p-3">
                    {h.date_sortie ? new Date(h.date_sortie).toLocaleString() : "—"}
                  </td>

                  {/* 🎛️ Boutons d’action accessibles */}
                  <td className="p-3 flex justify-center gap-3">
                    {/* 👁️ Voir */}
                    <button
                      onClick={() => navigate(`/hospitalisations/${h.id}`)}
                      title="Voir les détails de l’hospitalisation"
                      aria-label="Voir les détails de l’hospitalisation"
                      className="text-blue-500 hover:scale-110 transition p-2 rounded-lg hover:bg-blue-500/10 focus:ring-2 focus:ring-blue-400"
                    >
                      <FaEye aria-hidden="true" />
                    </button>

                    {/* ✏️ Modifier */}
                    <button
                      onClick={() => navigate(`/hospitalisations/modifier/${h.id}`)}
                      title="Modifier cette hospitalisation"
                      aria-label="Modifier cette hospitalisation"
                      className="text-yellow-500 hover:scale-110 transition p-2 rounded-lg hover:bg-yellow-500/10 focus:ring-2 focus:ring-yellow-400"
                    >
                      <FaEdit aria-hidden="true" />
                    </button>

                    {/* 🗑️ Supprimer */}
                    <button
                      onClick={() => handleDelete(h.id)}
                      title="Supprimer cette hospitalisation"
                      aria-label="Supprimer cette hospitalisation"
                      className="text-red-500 hover:scale-110 transition p-2 rounded-lg hover:bg-red-500/10 focus:ring-2 focus:ring-red-400"
                    >
                      <FaTrash aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default ListeHospitalisations;
