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

  // 📥 Charger hospitalisations
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

  // 🗑️ Supprimer
  const handleDelete = async (id: number) => {
    if (!window.confirm("❌ Supprimer cette hospitalisation ?")) return;
    try {
      await api.delete(`/hospitalisations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHospitalisations((prev) => prev.filter((h) => h.id !== id));
      toast.success("✅ Hospitalisation supprimée");
    } catch {
      toast.error("❌ Échec suppression hospitalisation");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-transparent backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FaHospitalUser className="text-purple-500" /> Hospitalisations
        </h1>
        <button
          onClick={() => navigate("/hospitalisations/ajouter")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105 transition"
        >
          <FaPlusCircle /> Nouvelle Hospitalisation
        </button>
      </div>

      {/* Table */}
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
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => navigate(`/hospitalisations/${h.id}`)}
                      className="text-blue-500 hover:scale-110 transition"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/hospitalisations/modifier/${h.id}`)}
                      className="text-yellow-500 hover:scale-110 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="text-red-500 hover:scale-110 transition"
                    >
                      <FaTrash />
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
