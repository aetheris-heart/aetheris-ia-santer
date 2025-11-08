import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { FaPlusCircle, FaNotesMedical, FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

export interface Soin {
  id: number;
  patient_id: number;
  type_soin: string;
  acte?: string;
  observations?: string;
  effectue_par?: string;
  date?: string | null;
}

const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

const ListeSoins: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [soins, setSoins] = useState<Soin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSoins = async () => {
    if (!token) return;
    try {
      const res = await api.get<Soin[]>("/soins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSoins(res.data);
    } catch {
      toast.error("❌ Impossible de charger les soins infirmiers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoins();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("❌ Supprimer ce soin ?")) return;
    try {
      await api.delete(`/soins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Soin supprimé");
      fetchSoins(); // 🔄 recharge en temps réel
    } catch {
      toast.error("❌ Échec suppression soin");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-transparent backdrop-blur-md">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FaNotesMedical className="text-purple-500" /> Soins Infirmiers
        </h1>
        <button
          onClick={() => navigate("/soins/ajouter")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105 transition"
        >
          <FaPlusCircle /> Nouveau Soin
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">⏳ Chargement...</p>
      ) : soins.length === 0 ? (
        <p className="text-gray-500 italic">Aucun soin enregistré.</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Acte</th>
                <th className="p-3 text-left">Effectué par</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {soins.map((s, idx) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-300 dark:border-gray-700 hover:bg-white/30 dark:hover:bg-gray-800/30 transition"
                >
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{s.patient_id}</td>
                  <td className="p-3">{s.type_soin}</td>
                  <td className="p-3">{s.acte || "—"}</td>
                  <td className="p-3">{s.effectue_par || "—"}</td>
                  <td className="p-3">{formatDate(s.date)}</td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => navigate(`/soins/${s.id}`)}
                      className="text-blue-500 hover:scale-110 transition"
                      title="Voir"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/soins/modifier/${s.id}`)}
                      className="text-yellow-500 hover:scale-110 transition"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
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

export default ListeSoins;
