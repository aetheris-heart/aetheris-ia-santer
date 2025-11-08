import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaWaveSquare } from "react-icons/fa";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/uui/ui_card";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";

interface Props {
  patientId: number;
}

interface NeurologicalStats {
  eeg: number;
  stress_level: number;
  anomalies_detectees?: string;
  alerte?: string;
  history?: { time: string; eeg: number }[];
  created_at?: string;
}

const NeurologiqueCard: React.FC<Props> = ({ patientId }) => {
  const { token } = useUser();
  const [stats, setStats] = useState<NeurologicalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 Récupération des données neurologiques depuis l’API
  const fetchNeurologiqueStats = async () => {
    if (!token || !patientId) return;
    try {
      const response = await api.get<NeurologicalStats>(`/neurologique/${patientId}/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error("❌ Erreur récupération données neurologiques :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeurologiqueStats();
    const interval = setInterval(fetchNeurologiqueStats, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  // 🧭 Navigation IA
  const handleClick = () => {
    navigate(`/neurologique/${patientId}`);
  };

  // 🎨 Couleur dynamique selon le stress
  const stressValue = stats?.stress_level ?? 0; // valeur par défaut si undefined

  const stressColor =
    stressValue > 80
      ? "#ef4444" // rouge
      : stressValue > 60
        ? "#f97316" // orange
        : "#22c55e"; // vert

  // 📈 Données EEG réelles (sinon tableau vide)
  const chartData =
    stats?.history && stats.history.length > 0
      ? stats.history
      : [
          { time: "0s", eeg: stats?.eeg ?? 0 },
          { time: "5s", eeg: stats?.eeg ?? 0 },
        ];

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
    >
      <Card className="relative w-full p-5 rounded-3xl shadow-xl border border-indigo-300/40 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50 via-purple-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-lg overflow-hidden">
        {/* 🌈 Halo lumineux IA */}
        <motion.div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl"
          style={{ background: `${stressColor}50` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <CardContent className="relative z-10">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <FaBrain size={26} className="text-indigo-600 dark:text-indigo-300" />
              <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                Fonction Neurologique
              </h3>
            </div>
            <FaWaveSquare
              className="text-purple-500 dark:text-purple-300 animate-pulse"
              size={22}
            />
          </div>

          {/* Données principales */}
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des données...</p>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">EEG</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-300">
                    {stats.eeg.toFixed(2)} μV
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Niveau de stress</p>
                  <p className="text-lg font-bold" style={{ color: stressColor }}>
                    {stats.stress_level.toFixed(1)} %
                  </p>
                </div>
              </div>

              {/* Graphique EEG */}
              <div className="h-24 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <RechartTooltip />
                    <Line
                      type="monotone"
                      dataKey="eeg"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Alertes IA */}
              {stats.alerte && (
                <p className="text-xs italic text-orange-600 dark:text-orange-300 mt-1">
                  ⚠️ {stats.alerte}
                </p>
              )}
              {stats.anomalies_detectees &&
                stats.anomalies_detectees.toLowerCase() !== "aucune" && (
                  <p className="text-xs italic text-red-600 dark:text-red-400 mt-1">
                    🚨 {stats.anomalies_detectees}
                  </p>
                )}
            </>
          ) : (
            <p className="text-sm text-gray-400">Aucune donnée disponible</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NeurologiqueCard;
