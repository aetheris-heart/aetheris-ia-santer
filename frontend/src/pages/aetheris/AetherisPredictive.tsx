import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Activity, AlertTriangle } from "lucide-react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

const AetherisPredictive: React.FC = () => {
  const { token } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictive = async () => {
      try {
        const res = await api.get("/aetheris/predictive", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Erreur prédictive :", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPredictive();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black text-white p-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-purple-400 to-blue-300 text-transparent bg-clip-text"
      >
        🔮 Détection Prédictive
      </motion.h1>

      {loading ? (
        <p className="text-center text-gray-400">Analyse en cours...</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border border-indigo-500/30 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <Brain className="text-purple-400" size={48} />
            <div>
              <h2 className="text-2xl font-bold">Réseau neuronal Aetheris</h2>
              <p className="text-gray-400 text-sm">Prédiction des risques cliniques</p>
            </div>
          </div>

          {data ? (
            <>
              <p className="text-lg text-gray-300 mb-3">
                Risque global détecté :{" "}
                <span className="text-yellow-300 font-semibold">
                  {data.global_risk || "Analyse en cours"}
                </span>
              </p>
              <div className="mt-6">
                <h3 className="font-bold text-indigo-300 mb-2">Anomalies détectées :</h3>
                <ul className="list-disc ml-6 text-gray-400">
                  {data.alerts?.length ? (
                    data.alerts.map((a: string, i: number) => <li key={i}>{a}</li>)
                  ) : (
                    <li>Aucune anomalie majeure</li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Aucune donnée reçue du moteur IA.</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AetherisPredictive;
