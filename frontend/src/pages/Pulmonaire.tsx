import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Wind, Activity, AlertTriangle, ArrowLeft, Droplets, Sparkles } from "lucide-react";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import { Card } from "@/components/uui/ui_card";
import { useUser } from "@/context/UserContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PulmonaireData {
  spo2?: number;
  frequence_respiratoire?: number;
  anomalies_detectees?: string;
  alerte?: string;
  created_at?: string;
}

const Pulmonaire: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();

  const [data, setData] = useState<PulmonaireData | null>(null);
  const [historique, setHistorique] = useState<{ t: string; spo2: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Récupération temps réel
  const fetchData = async () => {
    if (!token || !patientId) return;
    try {
      const res = await api.get<PulmonaireData>(`/pulmonaire/${patientId}/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      setHistorique((prev) => [
        ...prev.slice(-24),
        { t: new Date().toLocaleTimeString(), spo2: res.data.spo2 ?? 0 },
      ]);

      if ((res.data.spo2 ?? 100) < 92) {
        toast.warn("⚠️ SpO₂ faible détectée !", { position: "top-right" });
      } else if (res.data.alerte) {
        toast.info(`ℹ️ ${res.data.alerte}`);
      }
    } catch (err) {
      toast.error("❌ Erreur récupération données pulmonaires");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  const colorSpO2 = useMemo(() => {
    if (!data) return "#06b6d4";
    if ((data.spo2 ?? 100) < 90) return "#ef4444";
    if ((data.spo2 ?? 100) < 94) return "#f97316";
    return "#06b6d4";
  }, [data]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-cyan-400">
        <Activity className="w-10 h-10 animate-spin mb-3" />
        <p>Chargement des données pulmonaires...</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-cyan-400">
        ❌ Aucune donnée pulmonaire trouvée.
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full text-white hover:scale-105 transition"
        >
          ← Retour
        </button>
      </div>
    );

  return (
    <motion.div
      className="min-h-screen p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 💨 Halo respiratoire IA */}
      <motion.div
        className="fixed top-0 left-0 w-[25rem] h-[25rem] rounded-full blur-3xl opacity-30 -z-10"
        style={{ background: colorSpO2 }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* 🫁 En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
            <Wind className="animate-pulse" /> Fonction Pulmonaire — AETHERIS IA
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Analyse dynamique de la saturation et du rythme respiratoire.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-gray-200 transition-all"
        >
          <ArrowLeft size={18} /> Retour
        </button>
      </div>

      {/* 🩺 Indicateurs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* SpO2 */}
        <Card className="p-5 bg-white/10 border border-cyan-400/30 rounded-2xl shadow-lg hover:shadow-cyan-500/20 transition">
          <div className="flex items-center gap-3">
            <Droplets className="text-cyan-400" />
            <div>
              <p className="text-sm text-gray-400">Saturation SpO₂</p>
              <p className="text-3xl font-bold" style={{ color: colorSpO2 }}>
                {data.spo2 ?? "—"} %
              </p>
            </div>
          </div>
        </Card>

        {/* Fréquence */}
        <Card className="p-5 bg-white/10 border border-blue-400/30 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-300" />
            <div>
              <p className="text-sm text-gray-400">Fréquence respiratoire</p>
              <p className="text-2xl font-semibold text-blue-200">
                {data.frequence_respiratoire ?? "—"} insp/min
              </p>
            </div>
          </div>
        </Card>

        {/* Anomalies */}
        <Card className="p-5 bg-white/10 border border-gray-400/30 rounded-2xl shadow-lg hover:shadow-cyan-400/20 transition">
          <p className="text-sm text-gray-400 mb-2">Anomalies détectées</p>
          <p className="text-md font-semibold text-gray-200 italic">
            {data.anomalies_detectees ?? "Aucune"}
          </p>
        </Card>
      </div>

      {/* 📈 Graphique */}
      <Card className="p-6 bg-white/10 border border-cyan-500/20 rounded-2xl shadow-xl mb-10">
        <h2 className="text-lg font-semibold mb-3 text-cyan-300">
          📊 Évolution SpO₂ en temps réel
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={historique}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="t" stroke="#888" />
            <YAxis domain={[80, 100]} stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "none" }} />
            <Line
              type="monotone"
              dataKey="spo2"
              stroke={colorSpO2}
              strokeWidth={3}
              dot={false}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 🧬 Schéma pulmonaire interactif */}
      <Card className="p-6 bg-white/10 border border-cyan-400/20 rounded-2xl shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-cyan-300 flex items-center gap-2">
          <Sparkles className="text-cyan-400" /> Simulation alvéolaire — IA Aetheris
        </h2>
        <div className="flex justify-center">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 260"
            className="w-full max-w-3xl"
          >
            {/* Tranchée trachéale */}
            <motion.rect
              x="190"
              y="10"
              width="20"
              height="80"
              rx="5"
              fill="#60a5fa"
              animate={{
                height: [70, 90, 70],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            />

            {/* Poumon gauche */}
            <motion.ellipse
              cx="120"
              cy="160"
              rx="70"
              ry="100"
              fill="#0ea5e9"
              opacity="0.15"
              stroke="#22d3ee"
              strokeWidth="3"
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />

            {/* Poumon droit */}
            <motion.ellipse
              cx="280"
              cy="160"
              rx="70"
              ry="100"
              fill="#0891b2"
              opacity="0.15"
              stroke="#0ea5e9"
              strokeWidth="3"
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [1.05, 1, 1.05] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />

            {/* Flux d'air */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.circle
                key={i}
                cx="200"
                cy={40 + i * 40}
                r="3"
                fill="#67e8f9"
                animate={{
                  cy: [40 + i * 40, 200],
                  opacity: [1, 0.2],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.svg>
        </div>

        <p className="text-center text-sm text-gray-400 mt-3">
          Animation respiratoire simulée par Aetheris — basée sur le SpO₂ et la fréquence.
        </p>
      </Card>

      {/* ⚠️ Alerte */}
      {data.alerte && (
        <motion.div
          className="mt-10 p-4 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 flex items-center gap-3 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="animate-pulse" /> <span>{data.alerte}</span>
        </motion.div>
      )}

      {/* 🧠 Synthèse IA */}
      <Card className="mt-10 p-6 bg-gradient-to-r from-blue-600 to-cyan-700 text-white shadow-xl text-center rounded-2xl">
        <h2 className="text-lg font-semibold mb-2">🩺 Synthèse respiratoire Aetheris</h2>
        <p className="text-sm opacity-90">
          Saturation stable. Activité ventilatoire équilibrée. Aucun signe de détresse respiratoire
          détecté. Surveillance IA continue des alvéoles pulmonaires activée.
        </p>
      </Card>
    </motion.div>
  );
};

export default Pulmonaire;
