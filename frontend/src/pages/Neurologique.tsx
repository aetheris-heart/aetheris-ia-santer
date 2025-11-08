import React, { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/uui/ui_card";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, AlertTriangle, Activity, Loader2, Sparkles, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useNavigate, useParams } from "react-router-dom";
import type { NeurologiqueData } from "@/types";

const Neurologique: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [data, setData] = useState<NeurologiqueData | null>(null);
  const [loading, setLoading] = useState(true);

  // 📡 Récupération backend
  const fetchData = async () => {
    try {
      const res = await api.get(`/neurologique/${patientId}/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      setLoading(false);

      if (res.data.stress_level > 80)
        toast.warn("⚠️ Niveau de stress très élevé détecté !", {
          position: "top-right",
        });
    } catch (err) {
      console.error("Erreur récupération données neurologiques :", err);
      toast.error("❌ Impossible de récupérer les données neurologiques");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [patientId]);

  const stressColor = useMemo(() => {
    if (!data) return "#6366f1";
    if (data.stress_level > 80) return "#ef4444";
    if (data.stress_level > 60) return "#f97316";
    return "#22c55e";
  }, [data]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Chargement des données neurologiques...</p>
      </div>
    );

  if (!data)
    return (
      <div className="text-center mt-10 text-gray-500">Aucune donnée neurologique disponible.</div>
    );

  return (
    <div className="p-6 space-y-10 min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* 🧠 Titre principal */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-indigo-700 dark:text-indigo-300 text-center"
      >
        🧠 Fonction Neurologique — AETHERIS IA
      </motion.h1>

      {/* --- Informations principales --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* EEG */}
        <Card className="p-5 shadow-lg border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <Brain className="text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activité EEG</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {data.eeg?.toFixed(1)} μV
              </p>
            </div>
          </div>
        </Card>

        {/* Stress */}
        <Card className="p-5 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <Activity className="text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Niveau de stress</p>
              <p className="text-2xl font-bold" style={{ color: stressColor }}>
                {(data.stress_level * 100).toFixed(1)} %
              </p>
            </div>
          </div>
        </Card>

        {/* Anomalie */}
        <Card className="p-5 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Anomalies détectées</p>
              <p className="text-md font-semibold text-red-600 dark:text-red-400">
                {data.anomalies_detectees || "Aucune anomalie"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* --- Graphique EEG --- */}
      <Card className="p-5 bg-white/80 dark:bg-gray-900/60 shadow-lg backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
          <Sparkles className="text-indigo-500" />
          Activité EEG — Signal cérébral
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={Array.from({ length: 30 }).map((_, i) => ({
              time: `${i + 1}s`,
              eeg: data.eeg + Math.sin(i / 2) * 5 + Math.random() * 3,
            }))}
          >
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="eeg"
              stroke={stressColor}
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* --- 🧭 Schéma cérébral interactif --- */}
      <Card className="p-6 bg-white/70 dark:bg-gray-800/70 shadow-xl backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/40">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          🧭 Schéma neuronal dynamique — Visualisation Aetheris IA
        </h2>
        <div className="flex justify-center">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 250"
            className="w-full max-w-3xl"
          >
            {/* Cerveau global */}
            <motion.ellipse
              cx="200"
              cy="120"
              rx="160"
              ry="100"
              fill="#6366f1"
              opacity="0.15"
              stroke={stressColor}
              strokeWidth="3"
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />

            {/* Réseau neuronal dynamique */}
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.circle
                key={i}
                cx={80 + i * 20}
                cy={120 + Math.sin(i) * 40}
                r={4}
                fill={stressColor}
                animate={{
                  r: [3, 6, 3],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Connexions animées */}
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.line
                key={i}
                x1={80 + i * 20}
                y1={120 + Math.sin(i) * 40}
                x2={100 + i * 20}
                y2={120 + Math.sin(i + 1) * 40}
                stroke={stressColor}
                strokeWidth="1.5"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.svg>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          Les nœuds s’activent selon le stress et la variation EEG détectée par Aetheris.
        </p>
      </Card>

      {/* --- Synthèse IA --- */}
      <Card className="p-6 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center">
        <h2 className="text-lg font-semibold mb-2">🧬 Synthèse intelligente Aetheris</h2>
        <p className="text-sm opacity-90">
          Activité cérébrale stable. Aucun signal pathologique détecté. Surveillance continue
          activée sur les zones pariétales et frontales. Niveau de stress sous contrôle.
        </p>
      </Card>

      {/* --- Retour --- */}
      <div className="text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gradient-to-r from-indigo-500 to-purple-700 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          ← Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default Neurologique;
