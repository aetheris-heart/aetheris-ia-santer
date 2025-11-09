import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { FaPlusCircle, FaEye, FaEdit, FaTrash, FaXRay } from "react-icons/fa";
import { toast } from "react-toastify";

interface Imagerie {
  id: number;
  patient_id: number;
  type_examen: string;
  autre_examen?: string;
  fichier_url?: string;
  description?: string;
  effectue_par?: string;
  date_examen: string;
}

const ListeImageries: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [imageries, setImageries] = useState<Imagerie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .get<Imagerie[]>("/imageries", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setImageries(res.data))
      .catch(() => toast.error("❌ Impossible de charger les imageries"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("❌ Supprimer cet examen ?")) return;
    try {
      await api.delete(`/imageries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImageries((prev) => prev.filter((i) => i.id !== id));
      toast.success("✅ Imagerie supprimée");
    } catch {
      toast.error("❌ Échec suppression");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-transparent backdrop-blur-md">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FaXRay className="text-purple-500" /> Imageries
        </h1>
        <button
          onClick={() => navigate("/imageries/ajouter")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105 transition"
        >
          <FaPlusCircle /> Nouvel examen
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">⏳ Chargement...</p>
      ) : imageries.length === 0 ? (
        <p className="text-gray-500 italic">Aucun examen trouvé.</p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
          <table className="w-full border-collapse bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <th className="p-3">#</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Examen</th>
                <th className="p-3">Effectué par</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {imageries.map((i, idx) => (
                <tr
                  key={i.id}
                  className="border-b border-gray-300 dark:border-gray-700 hover:bg-white/40 dark:hover:bg-gray-800/40 transition"
                >
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{i.patient_id}</td>
                  <td className="p-3">{i.autre_examen || i.type_examen}</td>
                  <td className="p-3">{i.effectue_par || "—"}</td>
                  <td className="p-3">{new Date(i.date_examen).toLocaleString()}</td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
  onClick={() => navigate(`/imageries/${i.id}`)}
  title="Voir les détails de l’imagerie"
  aria-label="Voir les détails de l’imagerie"
  className="text-blue-500 hover:scale-110 transition p-2 rounded-lg hover:bg-blue-500/10 focus:ring-2 focus:ring-blue-400"
>
  <FaEye aria-hidden="true" />
</button>

<button
  onClick={() => navigate(`/imageries/modifier/${i.id}`)}
  title="Modifier cette imagerie"
  aria-label="Modifier cette imagerie"
  className="text-yellow-500 hover:scale-110 transition p-2 rounded-lg hover:bg-yellow-500/10 focus:ring-2 focus:ring-yellow-400"
>
  <FaEdit aria-hidden="true" />
</button>

<button
  onClick={() => handleDelete(i.id)}
  title="Supprimer cette imagerie"
  aria-label="Supprimer cette imagerie"
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

export default ListeImageries;
