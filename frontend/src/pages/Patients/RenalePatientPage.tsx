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

interface RenalData {
  average_creatinine?: number;
  average_urea?: number;
  alerte?: string | null;
  historique?: { time: string; creatinine: number; urea: number }[];
}

const RenalePatientPage: React.FC = () => {
  const { token } = useUser();
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<RenalData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Récupération initiale via API
  useEffect(() => {
    const fetchRenal = async () => {
      try {
        if (!token || !patientId) throw new Error("Token ou ID patient manquant");
        const res = await api.get<RenalData>(`/renal/${patientId}/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("❌ Erreur récupération données rénales :", err);
        toast.error("Impossible de charger les données rénales.");
      } finally {
        setLoading(false);
      }
    };
    fetchRenal();
    const interval = setInterval(fetchRenal, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  // 🔁 WebSocket temps réel
  useEffect(() => {
    if (!patientId) return;
    let socket: WebSocket;

    try {
      socket = new WebSocket(`ws://127.0.0.1:8000/ws/renal/${patientId}`);
    } catch (error) {
      console.error("❌ Impossible d’ouvrir le WebSocket :", error);
      return;
    }

    socket.onopen = () => console.log(`✅ WebSocket ouvert pour patient ${patientId}`);

    socket.onmessage = (event) => {
      try {
        const liveData = JSON.parse(event.data) as RenalData;
        setData((prev) => {
          if (!prev) return { ...liveData, historique: [] };
          return {
            ...prev,
            ...liveData,
            historique: [
              ...(prev.historique || []),
              {
                time: new Date().toLocaleTimeString(),
                creatinine: liveData.average_creatinine ?? 0,
                urea: liveData.average_urea ?? 0,
              },
            ].slice(-25),
          };
        });

        if (liveData.alerte) {
          toast.warn(`⚠️ ${liveData.alerte}`, { position: "top-right" });
        }
      } catch (e) {
        console.error("Erreur parsing WebSocket :", e);
      }
    };

    socket.onerror = (e) => {
      console.error("⚠️ Erreur WebSocket :", e);
      toast.error("Connexion temps réel perdue avec le serveur.");
    };

    socket.onclose = () => {
      console.warn("🔌 WebSocket fermé proprement.");
    };

    return () => socket.close();
  }, [patientId]);

  // 🧠 Analyse IA locale
  const analyseIA = () => {
    if (!data) return "Analyse IA indisponible.";
    const { average_creatinine, average_urea } = data;

    if (average_creatinine && average_creatinine > 2.0)
      return "⚠️ Hypercréatininémie : possible insuffisance rénale.";
    if (average_urea && average_urea > 50)
      return "⚠️ Urée élevée : suspicion de trouble de filtration glomérulaire.";
    if (average_creatinine && average_creatinine < 0.5)
      return "⚠️ Hypocréatininémie : possible dénutrition musculaire.";
    return "✅ Fonction rénale stable et équilibrée selon Aetheris IA.";
  };

  const safeNumber = (v?: number) => (typeof v === "number" && !isNaN(v) ? v.toFixed(2) : "--");

  const creatColor =
    data?.average_creatinine && data.average_creatinine > 2 ? "#ef4444" : "#22c55e";
  const ureaColor = data?.average_urea && data.average_urea > 50 ? "#f97316" : "#3b82f6";

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
          🧫 Fonction Rénale — Patient #{patientId}
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
          {/* --- Jauges circulaires --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <CircularProgressbar
                value={data.average_creatinine ?? 0}
                maxValue={3.0}
                text={`${safeNumber(data.average_creatinine)} mg/dL`}
                styles={buildStyles({
                  pathColor: creatColor,
                  textColor: creatColor,
                  trailColor: "#222",
                })}
              />
              <p className="mt-2 text-sm text-gray-400">Créatinine sanguine</p>
            </div>

            <div className="text-center">
              <CircularProgressbar
                value={data.average_urea ?? 0}
                maxValue={100}
                text={`${safeNumber(data.average_urea)} mg/dL`}
                styles={buildStyles({
                  pathColor: ureaColor,
                  textColor: ureaColor,
                  trailColor: "#222",
                })}
              />
              <p className="mt-2 text-sm text-gray-400">Taux d’urée</p>
            </div>
          </div>

          {/* --- Graphique --- */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
              📈 Évolution des taux rénaux
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.historique || []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#111", color: "#fff" }} />
                <Line
                  type="monotone"
                  dataKey="creatinine"
                  stroke={creatColor}
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="urea"
                  stroke={ureaColor}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* --- Schéma rénal --- */}
          <Card className="p-6 bg-white/60 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              🧬 Schéma rénal interactif
            </h3>
            <motion.svg
              viewBox="0 0 400 200"
              className="w-full max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.circle
                cx="120"
                cy="100"
                r="40"
                fill="#8b5cf6"
                opacity="0.6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <text x="120" y="105" textAnchor="middle" fill="#fff" fontSize="12">
                Rein G
              </text>

              <motion.circle
                cx="280"
                cy="100"
                r="40"
                fill="#6366f1"
                opacity="0.6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
              />
              <text x="280" y="105" textAnchor="middle" fill="#fff" fontSize="12">
                Rein D
              </text>

              <motion.path
                d="M150 130 Q200 170 250 130"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                animate={{ strokeOpacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              />
            </motion.svg>
            <p className="text-xs text-center text-gray-400 mt-3">
              Visualisation dynamique — filtration et connexion urétérale
            </p>
          </Card>

          {/* --- Analyse IA --- */}
          <Card className="p-4 bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              💡 <strong>Aetheris IA :</strong> {analyseIA()}
            </p>
          </Card>
        </div>
      ) : (
        <p className="text-center text-gray-400">Aucune donnée rénale disponible.</p>
      )}
    </div>
  );
};

export default RenalePatientPage;
