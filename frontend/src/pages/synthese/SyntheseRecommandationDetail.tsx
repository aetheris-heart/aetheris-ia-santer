import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, ClipboardList } from "lucide-react";
import api from "@/components/lib/axios";

interface RecommandationIA {
  texte: string;
  urgence?: string;
}

interface RecommandationsResponse {
  patient_id: number;
  recommandations: RecommandationIA[];
  total: number;
  analyse_par: string;
  message?: string;
}

const SyntheseRecommandationDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [recommandations, setRecommandations] = useState<RecommandationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Récupération des recommandations IA depuis l'API
  useEffect(() => {
    if (!token || !patientId) return;
    const fetchRecommandations = async () => {
      try {
        setLoading(true);
        const res = await api.get<RecommandationsResponse>(
          `/synthese-ia/${patientId}/recommandations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRecommandations(res.data);
      } catch (err) {
        console.error("❌ Erreur récupération recommandations :", err);
        setError("Impossible de récupérer les recommandations IA.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecommandations();
  }, [token, patientId]);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      {/* Titre */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent flex justify-center items-center gap-3">
          <ClipboardList className="w-8 h-8 animate-pulse text-emerald-400" />
          Recommandations IA
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
          Directives issues de l’analyse intelligente d’{" "}
          <span className="font-semibold text-emerald-500 dark:text-emerald-300">Aetheris</span>.
        </p>
      </motion.div>

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto backdrop-blur-lg bg-white/60 dark:bg-gray-900/40 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-300 dark:border-white/20"
      >
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">⏳ Chargement...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : !recommandations ||
          !recommandations.recommandations ||
          recommandations.recommandations.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Aucune recommandation disponible pour ce patient.
          </p>
        ) : (
          <>
            {/* Liste des recommandations */}
            <div>
              <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
                ✅ Recommandations proposées
              </h2>
              <ul className="list-disc ml-6 space-y-3 text-gray-700 dark:text-gray-200">
                {recommandations.recommandations.map((r, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-teal-500 dark:text-teal-300 font-medium">
                      {r.urgence ? `[${r.urgence}]` : "[Standard]"}
                    </span>{" "}
                    {r.texte}
                  </li>
                ))}
              </ul>
            </div>

            {/* Commentaire IA */}
            <div>
              <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mt-6 mb-2">
                🤖 Commentaire Aetheris
              </h2>
              <p className="italic text-purple-500 dark:text-purple-300">
                “Ces recommandations sont basées sur l’évolution clinique et les signaux détectés
                par l’intelligence Aetheris.”
              </p>
            </div>

            {/* Visualisation IA */}
            <div>
              <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-2">
                📊 Visualisation IA
              </h2>
              <div className="h-48 backdrop-blur-md bg-white/20 dark:bg-gray-800/60 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 text-lg font-semibold border border-gray-300 dark:border-white/10">
                (Diagramme des recommandations à venir)
              </div>
            </div>
          </>
        )}

        {/* Bouton retour */}
        <div className="text-center pt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:scale-105 transition-all text-white rounded-full shadow-lg"
          >
            <ArrowLeft className="mr-2" />
            Retour
          </button>
        </div>
      </motion.div>

      {/* Signature Aetheris */}
      <div className="mt-8 text-center text-emerald-500 dark:text-emerald-300">
        <Sparkles className="inline-block mr-1 animate-pulse" />
        Recommandations générées par <span className="font-bold">Aetheris</span>.
      </div>
    </div>
  );
};

export default SyntheseRecommandationDetail;
