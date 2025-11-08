import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { Brain, AlertTriangle, CheckCircle2, Activity } from "lucide-react";

interface SyntheseIA {
  id: number;
  patient_id: number;
  resume: string;
  score_global?: number;
  niveau_gravite?: string;
  created_at: string;
  risques?: string;
  patient?: {
    nom?: string;
    prenom?: string;
  };
}

const SyntheseList: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [syntheses, setSyntheses] = useState<SyntheseIA[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧩 Charger toutes les synthèses IA
  const fetchSyntheses = async () => {
    try {
      setLoading(true);
      const res = await api.get<SyntheseIA[]>("/synthese-ia/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSyntheses(res.data || []);
    } catch (err: any) {
      console.error("❌ Erreur chargement synthèses IA :", err);
      toast.error("Impossible de charger la synthèse IA globale");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSyntheses();
  }, [token]);

  // 💠 États d’attente
  if (loading)
    return (
      <div className="p-6 text-center text-gray-400">
        ⏳ Chargement de la vue globale IA Aetheris...
      </div>
    );

  if (syntheses.length === 0)
    return (
      <div className="p-6 text-center text-gray-500 italic">
        Aucun enregistrement de synthèse IA n’a encore été généré.
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent backdrop-blur-xl p-8 text-white">
      <h1 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-300 via-purple-300 to-teal-300 bg-clip-text text-transparent">
        🧠 Synthèse IA • Vue Globale
      </h1>

      {/* Grille des synthèses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {syntheses.map((synthese) => {
          const score = (synthese.score_global ?? 0) * 100;
          const gravite = synthese.niveau_gravite || "inconnue";
          const couleur =
            gravite === "rouge"
              ? "from-red-700/60 to-red-900/60 border-red-600/40"
              : gravite === "orange"
                ? "from-orange-700/60 to-orange-900/60 border-orange-600/40"
                : gravite === "jaune"
                  ? "from-yellow-600/60 to-yellow-800/60 border-yellow-500/40"
                  : "from-green-700/60 to-green-900/60 border-green-600/40";

          return (
            <motion.div
              key={synthese.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/synthese/${synthese.patient_id}`)}
              className={`p-5 rounded-2xl shadow-xl border ${couleur} bg-gradient-to-br cursor-pointer transition-all hover:shadow-2xl`}
            >
              {/* Titre */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {synthese.patient?.nom
                    ? `${synthese.patient.nom} ${synthese.patient.prenom}`
                    : `Patient #${synthese.patient_id}`}
                </h2>
                <Brain className="text-teal-300 w-6 h-6" />
              </div>

              {/* Score global */}
              <p className="mt-3 flex items-center gap-2 text-sm">
                <Activity className="text-cyan-400" />
                Score IA :
                <span
                  className={`font-bold ${
                    score > 70 ? "text-red-400" : score > 40 ? "text-yellow-400" : "text-green-400"
                  }`}
                >
                  {score.toFixed(1)}%
                </span>
              </p>

              {/* Niveau gravité */}
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-300">
                {gravite === "rouge" ? (
                  <AlertTriangle className="text-red-400 w-4 h-4" />
                ) : (
                  <CheckCircle2 className="text-green-400 w-4 h-4" />
                )}
                Gravité : {gravite.charAt(0).toUpperCase() + gravite.slice(1)}
              </p>

              {/* Résumé */}
              <p className="mt-3 text-gray-200 text-sm line-clamp-3 italic">“{synthese.resume}”</p>

              {/* Date */}
              <p className="mt-4 text-xs text-gray-400 text-right">
                {new Date(synthese.created_at).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SyntheseList;
