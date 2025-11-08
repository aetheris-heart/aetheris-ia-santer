import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";
import { UILoader } from "@/components/uui";

interface SyntheseIA {
  id: number;
  patient_id: number;
  resume: string;
  score_global?: number;
  niveau_gravite?: string;
  alertes_critiques?: string;
  created_at: string;
  patient?: {
    nom?: string;
    prenom?: string;
  };
}

const SyntheseAlertesDetail: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [alertes, setAlertes] = useState<SyntheseIA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlertes = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await api.get<SyntheseIA[]>("/synthese-ia/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // 🔎 On filtre uniquement les synthèses avec des alertes critiques
        const filtered = res.data.filter(
          (s) => s.alertes_critiques && s.alertes_critiques.trim() !== ""
        );
        setAlertes(filtered);
      } catch (err) {
        console.error("❌ Erreur lors du chargement des alertes :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlertes();
  }, [token]);

  return (
    <motion.div
      className="p-8 min-h-screen text-white bg-transparent backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 🔺 En-tête */}
      <div className="flex items-center gap-4 mb-8 justify-center">
        <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Synthèse des Alertes Critiques IA
        </h1>
      </div>

      {/* 🔄 Chargement */}
      {loading ? (
        <div className="flex justify-center py-20">
          <UILoader />
        </div>
      ) : alertes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {alertes.map((a) => (
            <motion.div
              key={a.id}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-2xl shadow-xl border ${
                a.niveau_gravite === "rouge"
                  ? "bg-red-900/30 border-red-700/30"
                  : a.niveau_gravite === "orange"
                    ? "bg-orange-900/30 border-orange-700/30"
                    : "bg-yellow-900/20 border-yellow-600/30"
              } backdrop-blur-lg cursor-pointer`}
              onClick={() => navigate(`/synthese/${a.patient_id}`)}
            >
              <h2 className="text-xl font-bold text-white mb-2">
                {a.patient?.nom
                  ? `${a.patient.nom} ${a.patient.prenom}`
                  : `Patient #${a.patient_id}`}
              </h2>

              <p className="text-sm text-gray-200 italic">{a.alertes_critiques}</p>

              <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                <span>🩺 Gravité : {a.niveau_gravite ?? "N/A"}</span>
                <span>
                  📅{" "}
                  {new Date(a.created_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <p className="mt-3 text-teal-300 text-sm">
                {a.resume.length > 80 ? a.resume.slice(0, 80) + "..." : a.resume}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-10">
          ✅ Aucune alerte critique active dans les synthèses IA.
        </div>
      )}

      {/* Retour */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-full shadow-lg hover:scale-105 transition"
        >
          <ArrowLeft className="inline mr-2" />
          Retour
        </button>
      </div>

      {/* Signature Aetheris */}
      <div className="mt-8 text-center text-red-400">
        <Sparkles className="inline-block mr-1 animate-pulse" />
        Surveillance en temps réel par <span className="font-bold">AETHERIS</span>.
      </div>
    </motion.div>
  );
};

export default SyntheseAlertesDetail;
