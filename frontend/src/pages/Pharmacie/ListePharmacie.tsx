import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaPills, FaPlusCircle, FaTrash, FaEdit, FaExclamationTriangle } from "react-icons/fa";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

interface Medicament {
  id: number;
  nom: string;
  forme: string;
  dosage?: string;
  quantite: number;
  seuil_alerte: number;
  date_peremption?: string;
  statut: string;
}

const ListePharmacie: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les médicaments
  useEffect(() => {
    if (!token) return;
    api
      .get<Medicament[]>("/pharmacie", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMedicaments(res.data))
      .catch(() => toast.error("❌ Impossible de charger la pharmacie"))
      .finally(() => setLoading(false));
  }, [token]);

  // Supprimer
  const handleDelete = async (id: number) => {
    if (!window.confirm("⚠️ Supprimer ce médicament ?")) return;
    try {
      await api.delete(`/pharmacie/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMedicaments((prev) => prev.filter((m) => m.id !== id));
      toast.success("✅ Médicament supprimé");
    } catch {
      toast.error("❌ Échec suppression médicament");
    }
  };

  return (
    <motion.div
      className="p-8 min-h-screen bg-transparent backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          <FaPills /> Gestion de la Pharmacie
        </h1>
        <button
          onClick={() => navigate("/pharmacie/ajouter")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105 transition"
        >
          <FaPlusCircle /> Ajouter un médicament
        </button>
      </div>

      {/* Table */}
{loading ? (
  <p className="text-gray-500">⏳ Chargement...</p>
) : medicaments.length === 0 ? (
  <p className="text-gray-500 italic">Aucun médicament trouvé.</p>
) : (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="overflow-x-auto"
  >
    <table className="w-full border-collapse bg-white/20 dark:bg-gray-900/30 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg">
      <thead>
        <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <th className="p-3 text-left">Nom</th>
          <th className="p-3 text-left">Forme</th>
          <th className="p-3 text-left">Dosage</th>
          <th className="p-3 text-left">Quantité</th>
          <th className="p-3 text-left">Statut</th>
          <th className="p-3 text-left">Péremption</th>
          <th className="p-3 text-center">Actions</th>
        </tr>
      </thead>

      <tbody>
        {medicaments.map((m) => (
          <tr
            key={m.id}
            className="border-b border-gray-300 dark:border-gray-700 hover:bg-white/40 dark:hover:bg-gray-800/40 transition"
          >
            <td className="p-3">{m.nom}</td>
            <td className="p-3">{m.forme}</td>
            <td className="p-3">{m.dosage || "—"}</td>
            <td className="p-3">{m.quantite}</td>
            <td
              className={`p-3 ${
                m.statut === "Rupture" ? "text-red-500" : "text-green-500"
              }`}
            >
              {m.statut}
            </td>
            <td className="p-3">
              {m.date_peremption
                ? new Date(m.date_peremption).toLocaleDateString()
                : "—"}
            </td>

            {/* Actions */}
            <td className="p-3 flex justify-center gap-3">
              {/* ✏️ Modifier */}
              <button
                onClick={() => navigate(`/pharmacie/modifier/${m.id}`)}
                aria-label={`Modifier le médicament ${m.nom}`}
                title={`Modifier ${m.nom}`}
                className="text-yellow-500 hover:scale-110 transition transform"
              >
                <FaEdit aria-hidden="true" />
              </button>

              {/* 🗑️ Supprimer */}
              <button
                onClick={() => handleDelete(m.id)}
                aria-label={`Supprimer le médicament ${m.nom}`}
                title={`Supprimer ${m.nom}`}
                className="text-red-500 hover:scale-110 transition transform"
              >
                <FaTrash aria-hidden="true" />
              </button>

              {/* ⚠️ Alerte de seuil */}
              {m.quantite <= m.seuil_alerte && (
                <FaExclamationTriangle
                  className="text-orange-500 animate-pulse"
                  aria-label="Seuil critique atteint"
                  title="Seuil critique atteint"
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </motion.div>
)}

      
    </motion.div>
  );
};

export default ListePharmacie;
