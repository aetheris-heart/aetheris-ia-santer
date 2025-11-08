import React, { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/uui/ui_card";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import {
  Droplet,
  Activity,
  AlertTriangle,
  Shield,
  Microscope,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

interface RenalData {
  creatinine?: number | null;
  filtration_glomerulaire?: number | null;
  anomalies_detectees?: string | null;
  alerte?: string | null;
  niveau_risque?: string | null;
  score_sante?: number | null;
  commentaire_ia?: string | null;
  historique?: { date: string; creatinine: number }[];
}

const Renale: React.FC = () => {
  const [data, setData] = useState<RenalData | null>(null);
  const { token } = useUser();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get<RenalData>("/renal/1/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      toast.error("❌ Erreur lors de la récupération des données rénales.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const historiqueData =
    data?.historique?.map((item) => ({
      time: item.date,
      creatinine: item.creatinine,
    })) || [];

  const risqueColor = useMemo(() => {
    switch (data?.niveau_risque) {
      case "Critique":
        return "#ef4444";
      case "Élevé":
        return "#f97316";
      case "Modéré":
        return "#facc15";
      default:
        return "#22c55e";
    }
  }, [data?.niveau_risque]);

  const colorFiltration =
    (data?.filtration_glomerulaire ?? 0) < 60
      ? "#ef4444"
      : (data?.filtration_glomerulaire ?? 0) < 90
        ? "#f97316"
        : "#22c55e";

  const colorCreatinine =
    (data?.creatinine ?? 0) > 1.3
      ? "#ef4444"
      : (data?.creatinine ?? 0) > 1.1
        ? "#f97316"
        : "#3b82f6";

  return (
    <div className="p-6 space-y-10">
      {/* --- Halo IA dynamique --- */}
      <motion.div
        className="fixed top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-30 -z-10"
        style={{ background: risqueColor }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* --- En-tête --- */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
          💧 Fonction Rénale — IA Aetheris
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
          {data?.commentaire_ia || "Analyse IA Aetheris en cours..."}
        </p>
      </motion.div>

      {/* --- Bloc principal --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Créatinine */}
        <Card className="p-5 shadow-lg border-l-4 border-blue-500 hover:scale-[1.02] transition">
          <div className="flex items-center gap-3">
            <Microscope className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Créatinine</p>
              <p className="text-2xl font-bold" style={{ color: colorCreatinine }}>
                {data?.creatinine != null ? `${data.creatinine.toFixed(2)} mg/dL` : "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Filtration glomérulaire */}
        <Card className="p-5 shadow-lg border-l-4 border-green-500 hover:scale-[1.02] transition">
          <div className="flex items-center gap-3">
            <Activity className="text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Filtration glomérulaire</p>
              <p className="text-2xl font-bold" style={{ color: colorFiltration }}>
                {data?.filtration_glomerulaire != null
                  ? `${data.filtration_glomerulaire.toFixed(1)} mL/min`
                  : "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Niveau de risque */}
        <Card className="p-5 shadow-lg border-l-4 border-yellow-500 hover:scale-[1.02] transition">
          <div className="flex items-center gap-3">
            <Shield className="text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Niveau de risque</p>
              <p className="text-xl font-bold" style={{ color: risqueColor }}>
                {data?.niveau_risque || "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Alerte IA */}
        <Card className="p-5 shadow-lg border-l-4 border-red-500 hover:scale-[1.02] transition">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500 animate-pulse" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Alerte IA</p>
              <p className="text-md font-semibold text-red-500">
                {data?.alerte || "Aucune alerte"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* --- Graphique IA --- */}
      <Card className="p-6 shadow-lg bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          📈 Évolution de la créatinine
        </h2>
        {historiqueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={historiqueData}>
              <Tooltip />
              <Area
                type="monotone"
                dataKey="creatinine"
                stroke={colorCreatinine}
                fill={`${colorCreatinine}30`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-sm text-gray-500">Pas encore d’historique disponible.</p>
        )}
      </Card>

      {/* --- Schéma rénal interactif --- */}
      <Card className="p-6 shadow-xl bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          🧭 Schéma rénal dynamique
        </h2>
        <div className="flex justify-center">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 240"
            className="w-full max-w-2xl"
          >
            {/* Flux sanguins animés */}
            <motion.line
              x1="200"
              y1="20"
              x2="200"
              y2="220"
              stroke="#3b82f6"
              strokeWidth="6"
              animate={{ y1: [20, 40, 20] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.line
              x1="210"
              y1="20"
              x2="210"
              y2="220"
              stroke="#ef4444"
              strokeWidth="5"
              animate={{ y2: [220, 200, 220] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />

            {/* Reins */}
            <motion.ellipse
              cx="110"
              cy="120"
              rx="60"
              ry="90"
              fill={colorCreatinine}
              opacity="0.25"
              stroke="#9333ea"
              strokeWidth="3"
              whileHover={{ scale: 1.05, opacity: 0.6 }}
            />
            <motion.ellipse
              cx="290"
              cy="120"
              rx="60"
              ry="90"
              fill={colorFiltration}
              opacity="0.25"
              stroke="#22c55e"
              strokeWidth="3"
              whileHover={{ scale: 1.05, opacity: 0.6 }}
            />

            {/* Uretères */}
            <motion.line
              x1="160"
              y1="200"
              x2="180"
              y2="230"
              stroke="#6366f1"
              strokeWidth="4"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.line
              x1="240"
              y1="200"
              x2="220"
              y2="230"
              stroke="#6366f1"
              strokeWidth="4"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Vessie */}
            <motion.ellipse
              cx="200"
              cy="235"
              rx="40"
              ry="10"
              fill="#60a5fa"
              opacity="0.3"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.svg>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          Les couleurs évoluent selon l’état clinique — indicateurs IA Aetheris.
        </p>
      </Card>

      {/* --- Retour --- */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition"
        >
          ← Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default Renale;
