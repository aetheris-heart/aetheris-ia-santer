import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFileMedical, FaEdit, FaTrash, FaFilePdf, FaEye, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

interface DossierMedical {
  id: number;
  patient_id: number;
  resume?: string;
  antecedents?: string;
  traitements?: string;
  allergies?: string;
  notes?: string;
  created_at: string;
}

const DossierList: React.FC = () => {
  const [dossiers, setDossiers] = useState<DossierMedical[]>([]);
  const [filtered, setFiltered] = useState<DossierMedical[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const res = await api.get<DossierMedical[]>("/dossiers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDossiers(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Erreur chargement dossiers :", err);
        setError("❌ Impossible de charger les dossiers médicaux.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDossiers();
  }, [token]);

  // 🔍 Recherche
  useEffect(() => {
    if (!search) {
      setFiltered(dossiers);
    } else {
      setFiltered(
        dossiers.filter((d) => (d.resume || "").toLowerCase().includes(search.toLowerCase()))
      );
    }
  }, [search, dossiers]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("⚠️ Supprimer ce dossier médical ?")) return;
    try {
      await api.delete(`/dossiers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDossiers(dossiers.filter((d) => d.id !== id));
      toast.success("✅ Dossier supprimé !");
    } catch (err) {
      console.error("Erreur suppression dossier :", err);
      toast.error("❌ Erreur lors de la suppression.");
    }
  };

  const handleExportPDF = async (id: number) => {
    try {
      const res = await api.get(`/pdf/${id}/export-pdf-rapport-v5`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rapport_Aetheris_Ultra_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("✅ Rapport AETHERIS Ultra Premium généré !");
    } catch (err) {
      console.error("Erreur export PDF :", err);
      toast.error("❌ Impossible de générer le rapport Ultra Premium.");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 via-white to-indigo-100 text-gray-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold drop-shadow-lg flex items-center gap-3 text-indigo-800">
          📁 Dossiers Médicaux
        </h1>
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute top-3 left-3 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un dossier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/60 
                       backdrop-blur-md border border-gray-300 
                       text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <p className="text-center text-gray-500">Chargement...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">Aucun dossier trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((dossier, index) => (
            <motion.div
              key={dossier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-3xl bg-white/70 backdrop-blur-lg 
                         border border-gray-200 shadow-lg hover:scale-105 transition-all"
            >
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-indigo-700">
                <FaFileMedical />
                Dossier #{dossier.id}
              </h2>
              <p className="text-sm text-gray-700 mb-1">
                📅 {new Date(dossier.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-800 mb-2">
                📝 {dossier.resume ? dossier.resume.slice(0, 60) + "..." : "—"}
              </p>

              {/* Actions */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => navigate(`/dossiers/${dossier.id}`)}
                  className="p-2 rounded-lg bg-blue-500/80 text-white hover:bg-blue-600 transition"
                  title="Voir dossier"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => navigate(`/dossiers/modifier/${dossier.id}`)}
                  className="p-2 rounded-lg bg-yellow-500/80 text-white hover:bg-yellow-600 transition"
                  title="Modifier"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(dossier.id)}
                  className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition"
                  title="Supprimer"
                >
                  <FaTrash />
                </button>
                <button
                  onClick={() => handleExportPDF(dossier.id)}
                  className="p-2 rounded-lg bg-green-500/80 text-white hover:bg-green-600 transition"
                  title="Exporter PDF"
                >
                  <FaFilePdf />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bouton ajouter */}
      <div className="mt-12 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dossiers/ajouter")}
          className="px-8 py-3 bg-indigo-600/80 hover:bg-indigo-700/90 
                     text-white text-lg rounded-2xl font-semibold 
                     shadow-lg backdrop-blur-md transition"
        >
          ➕ Créer un dossier médical
        </motion.button>
      </div>
    </div>
  );
};

export default DossierList;
