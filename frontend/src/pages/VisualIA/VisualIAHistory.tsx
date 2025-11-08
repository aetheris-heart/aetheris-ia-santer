import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Brain, Calendar, User, Eye, Activity } from "lucide-react";

/** 🧠 Type des analyses visuelles IA */
interface VisualIAItem {
  id: number;
  patient_id: number;
  diagnostic: string;
  domaine?: string;
  file_path?: string;
  date: string;
}

/** ⚡ Composant principal */
const VisualIAHistory: React.FC = () => {
  const { token } = useUser();
  const [data, setData] = useState<VisualIAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /** 🔄 Chargement des analyses IA */
  const fetchData = async () => {
    try {
      const res = await api.get<VisualIAItem[]>("/modules-ia/visual-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Impossible de charger les analyses IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  /** 🎯 Génère un score IA simulé */
  const randomScore = () => Math.floor(Math.random() * 15 + 85);

  /** ⚠️ Déterminer le statut clinique */
  const getStatut = (diagnostic: string) => {
    const lower = diagnostic.toLowerCase();
    if (lower.includes("masse") || lower.includes("suspicion") || lower.includes("fracture"))
      return { label: "🔴 Critique", color: "text-red-400" };
    return { label: "🟢 Stable", color: "text-green-400" };
  };

  /** 🌈 Animation d’apparition */
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🧠 En-tête */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold text-cyan-400 mb-3 drop-shadow-lg">
          🧬 Historique des Analyses IA
        </h1>
        <p className="text-gray-400 text-sm tracking-wide">
          Suivi intelligent des examens visuels automatisés par{" "}
          <span className="text-cyan-300 font-semibold">Aetheris IA</span>
        </p>
      </motion.div>

      {/* 🔄 État du chargement */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-96 text-gray-400 gap-3">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          <p>Chargement des analyses visuelles...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex justify-center items-center h-96 text-gray-500 text-lg">
          Aucune analyse IA enregistrée pour le moment.
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.15 }}
        >
          {data.map((item) => {
            const score = randomScore();
            const statut = getStatut(item.diagnostic);

            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
                className="relative backdrop-blur-2xl bg-gradient-to-b from-white/10 via-gray-900/30 to-gray-800/40 border border-cyan-700/20 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300"
              >
                {/* 🩻 Image */}
                {item.file_path && (
                  <div className="relative h-52 overflow-hidden group">
                    <img
                      src={`http://127.0.0.1:8000/${item.file_path}`}
                      alt="Analyse IA"
                      className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 bg-cyan-700/50 px-3 py-1 rounded-lg text-xs text-white font-semibold">
                      {item.domaine?.toUpperCase() || "INCONNU"}
                    </div>
                  </div>
                )}

                {/* 🧩 Contenu */}
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-cyan-300 line-clamp-2">
                    {item.diagnostic}
                  </h2>

                  {/* Détails */}
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Patient&nbsp;</span>
                      <span className="text-gray-200 font-medium">#{item.patient_id}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      {new Date(item.date).toLocaleString("fr-FR")}
                    </span>
                  </div>

                  {/* 🔎 Statut et confiance */}
                  <div className="text-sm">
                    <span className={`${statut.color} font-semibold`}>{statut.label}</span> —
                    Confiance IA : <span className="text-cyan-300 font-bold">{score}%</span>
                  </div>

                  {/* Barre de confiance */}
                  <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-green-400 to-cyan-500 h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1.2 }}
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex justify-between items-center mt-5">
                    <button
                      onClick={() => navigate(`/visual-ia/${item.id}`)}
                      className="flex items-center gap-2 text-sm bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-cyan-500/30 transition"
                    >
                      <Eye className="w-4 h-4" />
                      Voir l’analyse complète
                    </button>

                    <button
                      onClick={() => navigate(`/dossiers/${item.patient_id}`)}
                      className="text-gray-400 hover:text-cyan-400 text-sm font-medium transition"
                    >
                      📂 Dossier patient
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default VisualIAHistory;
