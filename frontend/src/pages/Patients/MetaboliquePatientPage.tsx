import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/uui/ui_card";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface HistoriquePoint {
  date: string;
  glucose: number;
}

interface MetaboliqueData {
  glucose: number;
  insulin: number;
  alerte: string;
  historique?: HistoriquePoint[];
}

const MetaboliquePatientPage: React.FC = () => {
  const { token } = useUser();
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<MetaboliqueData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Récupération initiale via API
  useEffect(() => {
    const fetchMetabolique = async () => {
      try {
        if (!token || !patientId) throw new Error("Token ou ID patient manquant");
        const res = await api.get<MetaboliqueData>(`/metabolique/${patientId}/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("❌ Erreur récupération données métaboliques :", err);
        toast.error("Impossible de charger les données métaboliques.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetabolique();
    const interval = setInterval(fetchMetabolique, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  // 🔁 WebSocket : mise à jour temps réel
  useEffect(() => {
    if (!patientId) return;
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/metabolique/${patientId}`);

    socket.onmessage = (event) => {
      const liveData = JSON.parse(event.data) as MetaboliqueData;
      setData((prev) => {
        if (!prev) return { ...liveData, historique: [] };
        return {
          ...prev,
          ...liveData,
          historique: [
            ...(prev.historique || []),
            { date: new Date().toLocaleTimeString(), glucose: liveData.glucose },
          ].slice(-20),
        };
      });

      if (liveData.alerte) {
        toast.warn(`⚠️ ${liveData.alerte}`, { position: "top-right" });
      }
    };

    return () => socket.close();
  }, [patientId]);

  // 🧠 Analyse IA locale
  const analyseIA = () => {
    if (!data) return "Analyse IA indisponible.";
    const { glucose, insulin } = data;

    if (glucose > 180) return "⚠️ Hyperglycémie détectée. Risque de déséquilibre glycémique.";
    if (glucose < 70) return "⚠️ Hypoglycémie possible. Vérifier apport glucidique.";
    if (insulin > 25)
      return "⚠️ Hyperinsulinémie observée. Possibilité de résistance à l’insuline.";
    return "✅ Métabolisme stable et bien régulé selon les données actuelles.";
  };

  const glucoseColor =
    data && data.glucose > 180 ? "#ef4444" : data && data.glucose < 70 ? "#f59e0b" : "#22c55e";

  const safeNumber = (v?: number) => (typeof v === "number" && !isNaN(v) ? v.toFixed(1) : "--");

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">
      {/* 🧭 En-tête */}
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center gap-3">
          🧪 Fonction Métabolique — Patient #{patientId}
        </h1>
        <button
          onClick={() => navigate(`/dossiers/${patientId}`)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg text-sm transition"
        >
          ← Retour
        </button>
      </motion.div>

      {loading ? (
        <p className="text-center text-gray-500">Chargement des données...</p>
      ) : data ? (
        <div className="space-y-10">
          {/* --- Indicateurs circulaires --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 🔹 Glucose */}
            <div className="text-center">
              <CircularProgressbar
                value={typeof data?.glucose === "number" ? data.glucose : 0}
                maxValue={300}
                text={`${safeNumber(data?.glucose)} mg/dL`}
                styles={buildStyles({
                  pathColor: glucoseColor,
                  textColor: glucoseColor,
                  trailColor: "#222",
                })}
              />
              <p className="mt-2 text-sm text-gray-400">Taux de glucose sanguin</p>
            </div>

            {/* 🔹 Insuline */}
            <div className="text-center">
              <CircularProgressbar
                value={typeof data?.insulin === "number" ? data.insulin : 0}
                maxValue={40}
                text={`${safeNumber(data?.insulin)} µU/mL`}
                styles={buildStyles({
                  pathColor: "#0ea5e9",
                  textColor: "#0ea5e9",
                  trailColor: "#222",
                })}
              />
              <p className="mt-2 text-sm text-gray-400">Taux d’insuline plasmatique</p>
            </div>
          </div>

          {/* --- Graphique historique --- */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
              📈 Évolution du glucose sanguin
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.historique || []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" hide />
                <YAxis domain={[40, 300]} />
                <Tooltip contentStyle={{ background: "#111", color: "#fff" }} />
                <Line
                  type="monotone"
                  dataKey="glucose"
                  stroke={glucoseColor}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* --- Schéma métabolique interactif --- */}
          <Card className="p-6 bg-white/60 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              🧬 Schéma interactif du métabolisme — Vue simplifiée Aetheris IA
            </h3>

            <motion.svg
              viewBox="0 0 700 300"
              className="w-full max-w-5xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* --- SANG (centre du métabolisme) --- */}
              <motion.circle
                cx="350"
                cy="150"
                r="40"
                fill={glucoseColor}
                stroke="#fff"
                strokeWidth="3"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <text x="350" y="155" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
                Sang
              </text>

              {/* --- PANCRÉAS --- */}
              <motion.rect
                x="100"
                y="120"
                width="90"
                height="60"
                fill="#0ea5e9"
                rx="10"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
              <text x="145" y="155" textAnchor="middle" fill="#fff" fontSize="12">
                Pancréas
              </text>

              {/* --- FOIE --- */}
              <motion.ellipse
                cx="570"
                cy="150"
                rx="60"
                ry="35"
                fill="#10b981"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                opacity="0.9"
              />
              <text x="570" y="155" textAnchor="middle" fill="#fff" fontSize="12">
                Foie
              </text>

              {/* --- MUSCLES --- */}
              <motion.rect
                x="280"
                y="30"
                width="140"
                height="40"
                fill="#f59e0b"
                rx="8"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2.8 }}
              />
              <text x="350" y="55" textAnchor="middle" fill="#fff" fontSize="12">
                Muscles
              </text>

              {/* --- CERVEAU --- */}
              <motion.circle
                cx="350"
                cy="260"
                r="25"
                fill="#8b5cf6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                opacity="0.85"
              />
              <text x="350" y="265" textAnchor="middle" fill="#fff" fontSize="12">
                Cerveau
              </text>

              {/* --- FLÈCHES INTERCONNECTÉES --- */}
              {/* Pancréas → Sang */}
              <motion.line
                x1="190"
                y1="150"
                x2="310"
                y2="150"
                stroke="#0ea5e9"
                strokeWidth="4"
                strokeDasharray="8"
                animate={{ strokeDashoffset: [8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              {/* Sang → Foie */}
              <motion.line
                x1="390"
                y1="150"
                x2="510"
                y2="150"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="8"
                animate={{ strokeDashoffset: [8, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              />
              {/* Sang → Muscles */}
              <motion.line
                x1="350"
                y1="110"
                x2="350"
                y2="70"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="8"
                animate={{ strokeDashoffset: [8, 0] }}
                transition={{ repeat: Infinity, duration: 1.7 }}
              />
              {/* Sang → Cerveau */}
              <motion.line
                x1="350"
                y1="190"
                x2="350"
                y2="235"
                stroke="#8b5cf6"
                strokeWidth="4"
                strokeDasharray="8"
                animate={{ strokeDashoffset: [8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.svg>

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 space-y-1">
              <p>
                🫀 <strong>Sang :</strong> transporte le glucose vers les organes.
              </p>
              <p>
                🍽️ <strong>Pancréas :</strong> libère l’insuline pour réguler le glucose.
              </p>
              <p>
                🧬 <strong>Foie :</strong> stocke le glucose sous forme de glycogène.
              </p>
              <p>
                💪 <strong>Muscles :</strong> consomment le glucose lors d’un effort.
              </p>
              <p>
                🧠 <strong>Cerveau :</strong> dépend entièrement du glucose pour fonctionner.
              </p>
            </div>
          </Card>

          {/* --- Analyse IA --- */}
          <Card className="p-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              💡 <strong>Aetheris IA :</strong> {analyseIA()}
            </p>
          </Card>
        </div>
      ) : (
        <p className="text-center text-gray-400">Aucune donnée métabolique disponible.</p>
      )}
    </div>
  );
};

export default MetaboliquePatientPage;
