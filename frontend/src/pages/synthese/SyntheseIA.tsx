import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/components/lib/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AlertTriangle, Brain, Sparkles, Activity } from "lucide-react";
import { useUser } from "@/context/UserContext";

// 🧠 Type aligné au backend FastAPI
interface SyntheseIAData {
  id: number;
  patient_id: number;
  medecin_id?: number;
  resume: string;
  recommandations?: string;
  risques?: string;
  score_global?: number;
  niveau_gravite?: string;
  tags?: string[];
  alertes_critiques?: string;
  anomalies_detectees?: string;
  recommandations_ia?: { type: string; message: string }[];
  valide_par_humain?: boolean;
  commentaire_medecin?: string;
  created_at: string;
}

// 🔹 Évolution simplifiée pour graphique
interface EvolutionPoint {
  name: string;
  score: number;
}

const SyntheseIA: React.FC = () => {
  const { token } = useUser();
  const [data, setData] = useState<SyntheseIAData | null>(null);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();

  // --- Récupération de la synthèse IA ---
  const fetchSynthese = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const url = patientId ? `/synthese-ia/${patientId}/latest` : "/synthese-ia/1/latest"; // fallback patient test

      const res = await api.get<SyntheseIAData>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (error) {
      console.error("❌ Erreur récupération synthèse IA :", error);
      toast.error("Impossible de charger la synthèse IA");
    } finally {
      setLoading(false);
    }
  };

  // --- Récupération de l’évolution du score ---
  const fetchEvolution = async () => {
    try {
      if (!patientId) return;
      const res = await api.get(`/synthese-ia/${patientId}/analyse-evolution`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.dernier_score) {
        setEvolution([
          { name: "Avant-dernier", score: res.data.dernier_score - res.data.variation },
          { name: "Dernier", score: res.data.dernier_score },
        ]);
      }
    } catch (error) {
      console.warn("⚠️ Erreur chargement évolution :", error);
    }
  };

  // --- Initialisation + Refresh périodique ---
  useEffect(() => {
    fetchSynthese();
    fetchEvolution();
    const interval = setInterval(() => fetchSynthese(true), 20000);
    return () => clearInterval(interval);
  }, [patientId]);

  // --- États d’attente ---
  if (loading)
    return <div className="p-6 text-center text-gray-400">⏳ Chargement de la synthèse IA...</div>;

  if (!data)
    return <div className="p-6 text-center text-red-500">❌ Aucune synthèse IA disponible</div>;

  // --- Couleur selon gravité ---
  const graviteCouleur =
    data.niveau_gravite === "rouge"
      ? "text-red-400"
      : data.niveau_gravite === "orange"
        ? "text-orange-400"
        : data.niveau_gravite === "jaune"
          ? "text-yellow-300"
          : "text-green-300";

  // --- Tags IA ---
  const tags = typeof data.tags === "string" ? data.tags.split(",") : data.tags || [];

  return (
    <div className="min-h-screen bg-transparent backdrop-blur-xl text-white p-8">
      {/* --- En-tête --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
          Synthèse IA • AETHERIS
        </h1>
        <p className="mt-2 text-gray-300 italic">
          “Analyse intelligente des risques et recommandations cliniques”
        </p>

        <p className="mt-4 font-semibold text-teal-300">
          Score global :{" "}
          <span className={`${graviteCouleur} text-2xl font-bold`}>
            {(data.score_global ?? 0 * 100).toFixed(2)}%
          </span>
          <span className="ml-2 text-gray-400">• {data.resume}</span>
        </p>

        {data.commentaire_medecin && (
          <p className="mt-1 text-sm text-gray-400 italic">
            Validé par médecin : “{data.commentaire_medecin}”
          </p>
        )}
      </motion.div>

      {/* --- Grille principale --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alertes critiques */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-red-900/30 p-5 rounded-2xl shadow-xl border border-red-700/30"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold text-red-400">
            <AlertTriangle /> Alertes critiques
          </h2>
          <p className="mt-3 text-sm text-gray-200">
            {data.alertes_critiques || "Aucune alerte détectée."}
          </p>
        </motion.div>

        {/* Anomalies détectées */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-indigo-900/30 p-5 rounded-2xl shadow-xl border border-indigo-700/30"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold text-indigo-400">
            <Brain /> Anomalies détectées
          </h2>
          <p className="mt-3 text-sm text-gray-200">
            {data.anomalies_detectees || "Aucune anomalie détectée."}
          </p>
        </motion.div>

        {/* Recommandations IA */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-green-900/30 p-5 rounded-2xl shadow-xl border border-green-700/30"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold text-green-400">
            <Sparkles /> Recommandations IA
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-gray-200">
            {Array.isArray(data.recommandations_ia) && data.recommandations_ia.length > 0 ? (
              data.recommandations_ia.map((r, idx) => (
                <li key={idx} className="cursor-pointer hover:text-green-300 transition-all">
                  [{r.type}] {r.message}
                </li>
              ))
            ) : (
              <p className="text-gray-400 italic">Aucune recommandation disponible.</p>
            )}
          </ul>
        </motion.div>
      </div>

      {/* --- Graphique évolution du score --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mt-12 bg-white/5 p-6 rounded-2xl shadow-lg"
      >
        <h2 className="text-xl font-bold text-teal-300 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Évolution du score IA
        </h2>
        {evolution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#00ffe7"
                strokeWidth={2}
                name="Score global"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 italic">Pas assez de données pour afficher une évolution.</p>
        )}
      </motion.div>

      {/* --- Tags et retour --- */}
      <div className="mt-12 text-center">
        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {tags.map((t, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs bg-teal-700/30 border border-teal-500/40 rounded-full"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg"
        >
          ↩️ Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default SyntheseIA;
