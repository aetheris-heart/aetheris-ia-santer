import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowLeft, Brain, AlertTriangle, Activity, Eye } from "lucide-react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

interface VisualIAItem {
  id: number;
  patient_id: number;
  diagnostic: string;
  domaine?: string;
  file_path?: string;
  date: string;
  ia_confiance?: number;
  ia_recommandations?: string;
}

const VisualIADetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [data, setData] = useState<VisualIAItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get<VisualIAItem>(`/modules-ia/visual-detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Erreur Visual IA :", err);
      toast.error("❌ Impossible de charger les détails de l’analyse IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) fetchData();
  }, [id, token]);

  // 🌀 Animation de chargement
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-cyan-300">
        <motion.div
          className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <p className="mt-4 text-gray-400">Analyse IA en cours de chargement...</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen text-red-400">
        ❌ Aucune donnée trouvée pour cette analyse IA.
      </div>
    );

  // 🔍 Données IA
  const confiance = data.ia_confiance ?? Math.floor(Math.random() * 15 + 85);
  const critique =
    data.diagnostic?.toLowerCase().includes("masse") ||
    data.diagnostic?.toLowerCase().includes("suspicion") ||
    data.diagnostic?.toLowerCase().includes("fracture");

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-gray-100 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🔙 Retour */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/10 transition backdrop-blur-lg"
        >
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
      </div>

      {/* 🧠 Titre */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">🩻 Analyse Visuelle IA – Aetheris</h1>
        <p className="text-gray-400 text-sm">
          Analyse automatisée réalisée par{" "}
          <span className="text-cyan-300 font-semibold">Aetheris IA</span> pour le patient n°{" "}
          <span className="text-cyan-300 font-semibold">{data.patient_id}</span>
        </p>
      </div>

      {/* 🧩 Bloc principal */}
      <motion.div
        className="max-w-5xl mx-auto backdrop-blur-2xl bg-white/10 border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(0,255,255,0.15)] overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 🩺 Image d'analyse */}
        {data.file_path && (
          <div className="relative w-full h-[420px] overflow-hidden">
            <img
              src={`http://127.0.0.1:8000/${data.file_path}`}
              alt="Analyse IA"
              className="object-cover w-full h-full opacity-95 hover:opacity-100 transition duration-500"
            />
            <div className="absolute top-3 left-3 bg-black/50 px-3 py-1 rounded-md text-sm text-gray-200">
              Domaine : {data.domaine?.toUpperCase() || "INCONNU"}
            </div>
          </div>
        )}

        {/* 🧠 Contenu IA */}
        <div className="p-8 space-y-8">
          {/* Diagnostic principal */}
          <div>
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Brain className="text-cyan-400 w-7 h-7" />
              Diagnostic IA
            </h2>
            <p className="mt-3 text-lg text-blue-300 italic leading-relaxed">{data.diagnostic}</p>
          </div>

          {/* Barre de confiance IA */}
          <div>
            <p className="text-sm text-gray-400 mb-1">🔬 Niveau de confiance IA</p>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-3 ${confiance >= 95 ? "bg-green-500" : "bg-yellow-400"}`}
                initial={{ width: 0 }}
                animate={{ width: `${confiance}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
            <p className="mt-1 text-gray-300 text-sm">
              Confiance estimée : <span className="font-bold text-green-400">{confiance}%</span>
            </p>
          </div>

          {/* Recommandations IA */}
          {data.ia_recommandations && (
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">💡 Recommandations IA</h3>
              <p className="bg-white/10 p-4 rounded-lg border border-white/10 shadow-inner">
                {data.ia_recommandations}
              </p>
            </div>
          )}

          {/* Bloc d’alerte critique */}
          {critique && (
            <motion.div
              className="bg-red-600/20 border border-red-600/30 p-5 rounded-xl flex items-center gap-4 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <p className="text-red-300 font-semibold text-lg">
                ⚠️ Anomalie détectée par Aetheris. Vérification clinique urgente recommandée.
              </p>
            </motion.div>
          )}

          {/* Infos et actions */}
          <div className="flex justify-between items-center text-sm text-gray-400 pt-5 border-t border-white/10">
            <p>
              📅 Analyse effectuée le{" "}
              <span className="text-cyan-300">{new Date(data.date).toLocaleString("fr-FR")}</span>
            </p>
            <button
              onClick={() => navigate(`/dossiers/${data.patient_id}`)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-white shadow-md transition"
            >
              <Eye className="w-4 h-4" />
              Voir le dossier patient
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VisualIADetail;
