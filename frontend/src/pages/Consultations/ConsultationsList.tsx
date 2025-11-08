import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { FaPlusCircle, FaStethoscope, FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

interface Consultation {
  id: number;
  patient_nom?: string;
  patient_prenom?: string;
  medecin_nom?: string;
  motif: string;
  diagnostic?: string;
  date_consultation: string;
}

const ConsultationsList: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger les consultations
  useEffect(() => {
    if (!token) return;
    api
      .get<Consultation[]>("/consultations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setConsultations(res.data))
      .catch((err) => {
        console.error("Erreur chargement consultations :", err);
        toast.error("❌ Impossible de charger les consultations");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // 🗑️ Supprimer une consultation
  const handleDelete = async (id: number) => {
    if (!window.confirm("⚠️ Supprimer cette consultation ?")) return;
    try {
      await api.delete(`/consultations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultations((prev) => prev.filter((c) => c.id !== id));
      toast.success("✅ Consultation supprimée");
    } catch (err: any) {
      console.error("Erreur suppression consultation :", err);
      toast.error(err.response?.data?.detail || "❌ Échec suppression consultation");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-transparent backdrop-blur-md">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FaStethoscope className="text-purple-500" /> Consultations
        </h1>
        <button
          onClick={() => navigate("/consultations/ajouter")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105 transition"
        >
          <FaPlusCircle /> Nouvelle Consultation
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">⏳ Chargement...</p>
      ) : consultations.length === 0 ? (
        <p className="text-gray-500 italic">Aucune consultation trouvée.</p>
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
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Médecin</th>
                <th className="p-3 text-left">Motif</th>
                <th className="p-3 text-left">Diagnostic</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-300 dark:border-gray-700 hover:bg-white/40 dark:hover:bg-gray-800/40 transition"
                >
                  <td className="p-3 font-semibold text-gray-700 dark:text-gray-200">{c.id}</td>
                  <td className="p-3">
                    {c.patient_prenom} {c.patient_nom}
                  </td>
                  <td className="p-3">{c.medecin_nom || "—"}</td>
                  <td className="p-3">{c.motif}</td>
                  <td className="p-3">{c.diagnostic || "—"}</td>
                  <td className="p-3">
                    {new Date(c.date_consultation).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => navigate(`/consultations/${c.id}`)}
                      className="text-blue-500 hover:scale-110 transition"
                      title="Voir détails"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/consultations/modifier/${c.id}`)}
                      className="text-yellow-500 hover:scale-110 transition"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:scale-110 transition"
                      title="Supprimer"
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

export default ConsultationsList;
