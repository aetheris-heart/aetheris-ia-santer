import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

interface SyntheseCardProps {
  patientId?: string;
}

interface SyntheseData {
  score_global: number;
  resume: string;
  niveau_gravite: string;
  alertes_critiques?: string;
  anomalies_detectees?: string;
  recommandations?: string;
  tendance?: string;
}

const SyntheseCard: React.FC<SyntheseCardProps> = ({ patientId }) => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState<SyntheseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchSynthese = async () => {
      try {
        setLoading(true);
        const url = patientId ? `/synthese-ia/${patientId}/latest` : `/synthese-ia/1/latest`; // 👈 patient par défaut si non spécifié

        const res = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("❌ Erreur chargement Synthèse IA:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSynthese();
  }, [token, patientId]);

  const graviteColor =
    data?.niveau_gravite === "rouge"
      ? "text-red-400"
      : data?.niveau_gravite === "orange"
        ? "text-orange-400"
        : data?.niveau_gravite === "jaune"
          ? "text-yellow-300"
          : "text-green-300";

  return (
    <motion.div
      className="relative p-6 rounded-2xl shadow-lg cursor-pointer overflow-hidden
                 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600
                 dark:from-indigo-700 dark:via-purple-700 dark:to-blue-700 text-white"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative z-10 text-center">
        <h2 className="text-2xl font-bold mb-3 drop-shadow-lg">🧠 Synthèse IA</h2>

        {loading ? (
          <p className="text-gray-200 italic">Chargement de la synthèse...</p>
        ) : data ? (
          <>
            <p className="text-sm text-gray-100 mb-4">{data.resume}</p>

            <div className="mb-4">
              <p className="text-lg font-bold">
                Score Global :{" "}
                <span className={graviteColor}>{Math.round((data.score_global || 0) * 100)}%</span>
              </p>
              <p className="text-sm italic text-gray-200">
                Gravité : {data.niveau_gravite?.toUpperCase()}
              </p>
            </div>

            <div className="flex justify-center gap-3 flex-wrap mt-4">
              <button
                onClick={() => navigate("/synthese/alertes")}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                disabled={!data?.alertes_critiques}
              >
                Alertes
              </button>
              <button
                onClick={() => navigate("/synthese/anomalies")}
                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition"
                disabled={!data?.anomalies_detectees}
              >
                Anomalies
              </button>
              <button
                onClick={() => navigate("/synthese/recommandations")}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition"
                disabled={!data?.recommandations}
              >
                Recommandations
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate(`/synthese/${patientId || 1}`)}
                className="px-6 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 transition font-semibold shadow"
              >
                Voir synthèse complète
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-200">Aucune synthèse disponible</p>
        )}
      </div>

      {/* Effet lumineux */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 to-green-400 opacity-25 blur-2xl"
        animate={{ x: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default SyntheseCard;
