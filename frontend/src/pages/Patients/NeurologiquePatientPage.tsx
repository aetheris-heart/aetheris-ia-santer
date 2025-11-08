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

interface NeurologiqueData {
  eeg: number;
  stress_level: number;
  history?: { time: string; eeg: number }[];
  alerte?: string;
}

const NeurologiquePatientPage: React.FC = () => {
  const { token } = useUser();
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<NeurologiqueData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🧩 Récupération initiale via API
  useEffect(() => {
    const fetchNeurologique = async () => {
      try {
        if (!token || !patientId) throw new Error("Token ou ID patient manquant");
        const res = await api.get<NeurologiqueData>(`/neurological/${patientId}/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("❌ Erreur récupération données neurologiques :", err);
        toast.error("Impossible de charger les données neurologiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchNeurologique();
    const interval = setInterval(fetchNeurologique, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  // 🔁 WebSocket temps réel
  useEffect(() => {
    if (!patientId) return;
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/neurological/${patientId}`);

    socket.onmessage = (event) => {
      const liveData = JSON.parse(event.data) as NeurologiqueData;
      setData((prev) => {
        if (!prev) return { ...liveData, history: [] };
        return {
          ...prev,
          ...liveData,
          history: [
            ...(prev.history || []),
            { time: new Date().toLocaleTimeString(), eeg: liveData.eeg },
          ].slice(-30),
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
    const { eeg, stress_level } = data;
    if (eeg < 10)
      return "⚠️ Activité cérébrale faible. Somnolence ou baisse de vigilance détectée.";
    if (eeg > 80) return "⚠️ Activité neuronale élevée. Crise ou surstimulation possible.";
    if (stress_level > 70) return "🚨 Niveau de stress critique. Risque de surcharge cognitive.";
    return "✅ Activité cérébrale stable et cohérente selon Aetheris IA.";
  };

  // 🎨 Couleur EEG dynamique
  const eegColor =
    data && data.eeg > 80 ? "#ef4444" : data && data.eeg < 10 ? "#f59e0b" : "#8b5cf6";

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">
      {/* 🧭 En-tête */}
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-3">
          🧠 Fonction Neurologique — Patient #{patientId}
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
            <div className="text-center">
              <CircularProgressbar
                value={data.eeg}
                maxValue={100}
                text={`${data.eeg.toFixed(1)} µV`}
                styles={buildStyles({
                  pathColor: eegColor,
                  textColor: eegColor,
                  trailColor: "#222",
                })}
              />
              <p className="mt-2 text-sm text-gray-400">Activité EEG</p>
            </div>

            <div className="text-center">
              <CircularProgressbar
                value={data.stress_level}
                maxValue={100}
                text={`${data.stress_level.toFixed(1)} %`}
                styles={buildStyles({
                  pathColor:
                    data.stress_level > 70
                      ? "#ef4444"
                      : data.stress_level > 50
                        ? "#facc15"
                        : "#22c55e",
                  textColor: "#f472b6",
                  trailColor: "#222",
                })}
              />
              <p className="mt-2 text-sm text-gray-400">Niveau de stress</p>
            </div>
          </div>

          {/* --- Graphique EEG --- */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
              📈 Évolution des ondes EEG
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.history || []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#111", color: "#fff" }} />
                <Line
                  type="monotone"
                  dataKey="eeg"
                  stroke={eegColor}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* --- Schéma cérébral animé --- */}
          <Card className="p-6 bg-white/60 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              🧬 Schéma cérébral interactif
            </h3>
            <motion.svg
              viewBox="0 0 400 200"
              className="w-full max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Hémisphère gauche */}
              <motion.ellipse
                cx="130"
                cy="100"
                rx="80"
                ry="50"
                fill="#a78bfa"
                opacity="0.5"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <text x="130" y="105" textAnchor="middle" fill="#fff" fontSize="12">
                Hémisphère gauche
              </text>

              {/* Hémisphère droit */}
              <motion.ellipse
                cx="270"
                cy="100"
                rx="80"
                ry="50"
                fill="#7c3aed"
                opacity="0.5"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
              />
              <text x="270" y="105" textAnchor="middle" fill="#fff" fontSize="12">
                Hémisphère droit
              </text>

              {/* Connexions neuronales */}
              <motion.path
                d="M150 90 Q200 70 250 90"
                fill="none"
                stroke="#f472b6"
                strokeWidth="3"
                strokeLinecap="round"
                animate={{ strokeOpacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              />
            </motion.svg>
            <p className="text-xs text-center text-gray-400 mt-3">
              Visualisation dynamique — activité cérébrale détectée en temps réel.
            </p>
          </Card>

          {/* --- Analyse IA --- */}
          <Card className="p-4 bg-purple-100 dark:bg-purple-900/30 border-l-4 border-purple-500">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              💡 <strong>Aetheris IA :</strong> {analyseIA()}
            </p>
          </Card>
        </div>
      ) : (
        <p className="text-center text-gray-400">Aucune donnée neurologique disponible.</p>
      )}
    </div>
  );
};

export default NeurologiquePatientPage;
