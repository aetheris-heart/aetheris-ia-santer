// frontend/src/pages/Dossiers/DossierDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaFilePdf,
  FaTrash,
  FaEdit,
  FaNotesMedical,
  FaPills,
  FaAllergies,
  FaClipboardList,
} from "react-icons/fa";

interface DossierMedical {
  id: number;
  patient_id: number;
  resume?: string;
  antecedents?: string;
  traitements?: string;
  allergies?: string;
  notes?: string;
  statut?: string;
  medecin_referent?: string;
  service?: string;
  created_at: string;
}

const DossierDetail: React.FC = () => {
  const { dossierId } = useParams<{ dossierId: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<DossierMedical | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le dossier
  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const res = await api.get<DossierMedical>(`/dossiers/${dossierId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDossier(res.data);
      } catch (err) {
        console.error("Erreur chargement dossier :", err);
        toast.error("❌ Impossible de charger le dossier médical.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDossier();
  }, [dossierId, token]);

  // Export PDF
  const handleExportPDF = async () => {
    try {
      const res = await api.get(`/dossiers/${dossierId}/export-pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Dossier_${dossierId}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("📄 Export PDF généré !");
    } catch (err) {
      console.error("Erreur export PDF :", err);
      toast.error("❌ Impossible d’exporter le PDF.");
    }
  };

  // Supprimer
  const handleDelete = async () => {
    if (!window.confirm("⚠️ Supprimer définitivement ce dossier ?")) return;
    try {
      await api.delete(`/dossiers/${dossierId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ Dossier supprimé avec succès.");
      navigate("/dossiers");
    } catch (err) {
      console.error("Erreur suppression dossier :", err);
      toast.error("❌ Impossible de supprimer le dossier.");
    }
  };

  if (loading) return <div className="p-6 text-center">⏳ Chargement...</div>;
  if (!dossier) return <div className="p-6 text-center">⚠️ Dossier introuvable.</div>;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 text-gray-900 dark:text-white space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white/40 dark:bg-gray-700/60 backdrop-blur-md rounded-lg shadow hover:bg-white/60 transition flex items-center gap-2"
        >
          <FaArrowLeft /> Retour
        </motion.button>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/dossiers/modifier/${dossier.id}`)}
            className="px-4 py-2 bg-blue-600/80 text-white rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaEdit /> Modifier
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleExportPDF}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
          >
            <FaFilePdf /> Export PDF
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600/80 text-white rounded-lg shadow hover:bg-red-700 transition flex items-center gap-2"
          >
            <FaTrash /> Supprimer
          </motion.button>
        </div>
      </div>

      {/* Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Résumé */}
        <Card className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
          <CardContent>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
              <FaClipboardList className="text-indigo-500" /> Résumé
            </h2>
            <p>{dossier.resume || "—"}</p>
          </CardContent>
        </Card>

        {/* Antécédents */}
        <Card className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
          <CardContent>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
              <FaNotesMedical className="text-pink-500" /> Antécédents
            </h2>
            <p>{dossier.antecedents || "—"}</p>
          </CardContent>
        </Card>

        {/* Traitements */}
        <Card className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
          <CardContent>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
              <FaPills className="text-green-500" /> Traitements
            </h2>
            <p>{dossier.traitements || "—"}</p>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
          <CardContent>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
              <FaAllergies className="text-red-500" /> Allergies
            </h2>
            <p>{dossier.allergies || "—"}</p>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl md:col-span-2">
          <CardContent>
            <h2 className="text-xl font-bold mb-3">📝 Notes internes</h2>
            <p>{dossier.notes || "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <p className="text-sm opacity-70 text-center">
        📅 Créé le {new Date(dossier.created_at).toLocaleDateString()}
      </p>
    </div>
  );
};

export default DossierDetail;
