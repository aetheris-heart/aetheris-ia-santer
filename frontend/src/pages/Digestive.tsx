import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/uui/ui_card";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import { AlertTriangle, Flame, Activity, ShieldAlert, Brain, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";

interface AciditeHistorique {
  date: string;
  valeur: number;
}

interface DigestiveStats {
  acidite: number;
  motricite: number;
  inflammation: number;
  niveau_risque?: string;
  score_sante?: number;
  commentaire_ia?: string;
  historique_acidite: AciditeHistorique[];
  alerte?: string;
}

const Digestive: React.FC = () => {
  const [data, setData] = useState<DigestiveStats | null>(null);
  const { token } = useUser();
  const navigate = useNavigate();

  // 🔁 Récupération API
  const fetchData = async () => {
    try {
      const res = await api.get<DigestiveStats>("/digestive/1/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      if (res.data.alerte)
        toast.warn(`⚠️ ${res.data.alerte}`, { position: "top-right", autoClose: 4000 });
    } catch (err) {
      toast.error("❌ Erreur récupération données digestives.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 15000);
    return () => clearInterval(i);
  }, []);

  // 🎨 Couleurs dynamiques
  const getPhColor = (pH: number) =>
    pH < 4 ? "#ef4444" : pH < 6 ? "#f97316" : pH <= 8 ? "#22c55e" : "#8b5cf6";

  const colorInflammation = useMemo(() => {
    if (!data) return "#facc15";
    if (data.inflammation > 70) return "#ef4444";
    if (data.inflammation > 40) return "#f97316";
    return "#22c55e";
  }, [data]);

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Chargement de l’analyse digestive...
      </div>
    );

  return (
    <div className="p-6 space-y-10 bg-gradient-to-br from-orange-50 via-yellow-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen transition">
      {/* 🔶 En-tête */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
          🥣 Fonction Digestive — AETHERIS IA
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {data.commentaire_ia || "Analyse en cours par Aetheris IA..."}
        </p>
      </motion.div>

      {/* 📊 Indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Acidité gastrique</p>
              <p className="text-2xl font-bold" style={{ color: getPhColor(data.acidite) }}>
                {data.acidite.toFixed(2)} pH
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Motricité intestinale</p>
              <p className="text-2xl font-semibold text-blue-400">
                {data.motricite.toFixed(1)} mm/s
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inflammation</p>
              <p className="text-2xl font-bold" style={{ color: colorInflammation }}>
                {typeof data.inflammation === "number"
                  ? `${data.inflammation.toFixed(1)} %`
                  : (data.inflammation ?? "—")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <Brain className="text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Score santé IA</p>
              <p className="text-2xl font-bold text-green-500">
                {data.score_sante?.toFixed(1) ?? 0} %
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 📉 Graphique pH */}
      <Card className="p-6 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          📈 Historique du pH gastrique
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={(data.historique_acidite ?? []).map((p) => ({
              time: p.date,
              value: p.valeur,
            }))}
          >
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 14]} />
            <Tooltip />
            <ReferenceArea y1={6} y2={8} fill="#22c55e" opacity={0.15} />
            <Line type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Zone verte = équilibre gastrique optimal (pH entre 6 et 8)
        </p>
      </Card>

      {/* 🧭 Schéma dynamique */}
      <Card className="p-6 bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Sparkles className="text-orange-400" /> Schéma interactif du système digestif
        </h2>
        <div className="flex justify-center">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 300"
            className="w-full max-w-3xl"
          >
            {/* Œsophage */}
            <motion.rect
              x="190"
              y="10"
              width="20"
              height="60"
              fill="#f59e0b"
              opacity="0.4"
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            />

            {/* Estomac */}
            <motion.ellipse
              cx="200"
              cy="120"
              rx="65"
              ry="40"
              fill={getPhColor(data.acidite)}
              opacity="0.2"
              stroke={getPhColor(data.acidite)}
              strokeWidth="3"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
            <text x="170" y="125" fontSize="11" fill="#ea580c">
              Estomac
            </text>

            {/* Intestin grêle */}
            <motion.path
              d="M130 160 Q200 200 270 160 T360 160"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              animate={{
                pathLength: [0.6, 1, 0.6],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 5 }}
            />
            <text x="180" y="180" fontSize="11" fill="#3b82f6">
              Intestin grêle
            </text>

            {/* Côlon */}
            <motion.path
              d="M100 200 Q200 260 300 200"
              fill="none"
              stroke="#22c55e"
              strokeWidth="5"
              strokeLinecap="round"
              animate={{
                opacity: [0.4, 0.9, 0.4],
                pathLength: [0.5, 1, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 6 }}
            />
            <text x="180" y="230" fontSize="11" fill="#22c55e">
              Côlon
            </text>
          </motion.svg>
        </div>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
          Les couleurs et pulsations varient selon l’activité gastrique et l’inflammation IA.
        </p>
      </Card>

      {/* ⚠️ Alerte */}
      {data.alerte && (
        <motion.div
          className="p-4 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-400 flex items-center gap-3 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="animate-pulse" /> {data.alerte}
        </motion.div>
      )}

      {/* 🧠 Synthèse IA */}
      <Card className="p-6 text-center text-white bg-gradient-to-r from-orange-600 to-red-700 shadow-xl rounded-2xl">
        <h2 className="text-lg font-semibold mb-2">🧠 Synthèse digestive Aetheris</h2>
        <p className="text-sm opacity-90">
          pH gastrique {data.acidite < 4 ? "trop acide" : "équilibré"}, motricité{" "}
          {data.motricite < 1 ? "ralentie" : "normale"}, inflammation{" "}
          {data.inflammation > 60 ? "élevée" : "faible"}. État général :{" "}
          <strong className="text-white">{data.niveau_risque || "Stable"}</strong>. Surveillance IA
          continue activée.
        </p>
      </Card>

      {/* 🔙 Retour */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition"
        >
          ← Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default Digestive;
