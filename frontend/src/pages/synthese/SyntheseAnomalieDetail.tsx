import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BrainCircuit, ArrowLeft, Sparkles } from "lucide-react";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";

interface SyntheseIA {
  id: number;
  patient_id: number;
  anomalies_detectees?: string;
  niveau_gravite?: string;
  created_at: string;
  resume?: string;
  patient?: {
    nom?: string;
    prenom?: string;
  };
}

const SyntheseAnomalieDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { token } = useUser();
  const navigate = useNavigate();
  const [synthese, setSynthese] = useState<SyntheseIA | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Charger les anomalies d’un patient ou globales
  useEffect(() => {
    if (!token) return;

    const fetchAnomalie = async () => {
      try {
        setLoading(true);
        const id = patientId || "1";

        const url = `/dashboard/synthese/${id}`;
        const res = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSynthese(res.data);
      } catch (err: any) {
        console.error("❌ Erreur récupération anomalies :", err);
        setError("Impossible de récupérer les anomalies IA.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalie();
  }, [token, patientId]);

  return (
    <div className="min-h-screen p-8 bg-transparent backdrop-blur-xl text-white">
      {/* Titre principal */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent flex justify-center items-center gap-3">
          <BrainCircuit className="w-8 h-8 animate-pulse text-indigo-400" />
          Détail des Anomalies IA
        </h1>
        <p className="text-sm text-gray-300 mt-2 italic">
          Analyse approfondie des anomalies détectées par{" "}
          <span className="font-semibold text-indigo-300">Aetheris</span>.
        </p>
      </motion.div>

      {/* Bloc principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl p-8 space-y-6 border border-white/20"
      >
        {loading ? (
          <p className="text-center text-gray-400">⏳ Chargement des données...</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : !synthese ? (
          <p className="text-center text-gray-400">Aucune anomalie détectée.</p>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold text-indigo-400 mb-2">🧠 Anomalies détectées</h2>
              <p className="text-gray-200 leading-relaxed">
                {synthese.anomalies_detectees ||
                  "Aucune anomalie spécifique détectée pour ce patient."}
              </p>
            </div>

            {synthese.resume && (
              <div>
                <h2 className="text-xl font-semibold text-purple-400 mt-6 mb-2">
                  🩺 Contexte clinique
                </h2>
                <p className="text-gray-300 italic">{synthese.resume}</p>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-blue-400 mt-6 mb-2">📊 Visualisation IA</h2>
              <div className="h-56 backdrop-blur-md bg-white/10 rounded-xl flex items-center justify-center text-gray-300 text-lg font-semibold border border-white/20">
                (Schéma d’analyse IA en préparation)
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-rose-400 mb-2">⚕️ Gravité estimée</h2>
              <p className="text-sm text-gray-300">
                Niveau de gravité :{" "}
                <span
                  className={
                    synthese.niveau_gravite === "rouge"
                      ? "text-red-400"
                      : synthese.niveau_gravite === "orange"
                        ? "text-orange-300"
                        : synthese.niveau_gravite === "jaune"
                          ? "text-yellow-300"
                          : "text-green-300"
                  }
                >
                  {synthese.niveau_gravite ?? "Non spécifié"}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Dernière mise à jour :{" "}
                {new Date(synthese.created_at).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </>
        )}

        {/* Bouton retour */}
        <div className="text-center pt-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 hover:scale-105 transition text-white rounded-full shadow-lg"
          >
            <ArrowLeft className="mr-2" />
            Retour
          </button>
        </div>
      </motion.div>

      {/* Signature */}
      <div className="mt-8 text-center text-indigo-400">
        <Sparkles className="inline-block mr-1 animate-pulse" />
        Analyse assurée par <span className="font-bold">Aetheris</span>.
      </div>
    </div>
  );
};

export default SyntheseAnomalieDetail;
