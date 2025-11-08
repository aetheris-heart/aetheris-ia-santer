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

interface DigestiveData {
  acidite: number;
  motricite: number;
  inflammation: number;
  alerte: string;
  historique?: { date: string; acidite: number }[];
}

const DigestivePatientPage: React.FC = () => {
  const { token } = useUser();
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<DigestiveData | null>(null);
  const [loading, setLoading] = useState(true);

  const safeNumber = (v?: any) => (typeof v === "number" && !isNaN(v) ? v.toFixed(1) : "--");

  // 🔹 Chargement initial
  useEffect(() => {
    const fetchDigestive = async () => {
      try {
        if (!token || !patientId) throw new Error("Token ou ID patient manquant");
        const res = await api.get<DigestiveData>(`/digestive/${patientId}/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("❌ Erreur récupération données digestives :", err);
        toast.error("Impossible de charger les données digestives.");
      } finally {
        setLoading(false);
      }
    };
    fetchDigestive();

    const interval = setInterval(fetchDigestive, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  // 🔁 WebSocket temps réel
  useEffect(() => {
    if (!patientId) return;
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/digestive/${patientId}`);

    socket.onopen = () => console.log("✅ WebSocket digestive connectée");
    socket.onmessage = (event) => {
      try {
        const liveData = JSON.parse(event.data) as DigestiveData;
        setData((prev) => {
          if (!prev) return { ...liveData, historique: [] };
          return {
            ...prev,
            ...liveData,
            historique: [
              ...(prev.historique || []),
              { date: new Date().toLocaleTimeString(), acidite: liveData.acidite },
            ].slice(-20),
          };
        });
        if (liveData.alerte) {
          toast.warn(`⚠️ ${liveData.alerte}`, { position: "top-right" });
        }
      } catch (e) {
        console.error("Erreur parsing WS digestive:", e);
      }
    };
    socket.onerror = (err) => console.error("❌ Erreur WebSocket:", err);
    socket.onclose = () => console.log("❌ WebSocket digestive fermée");

    return () => socket.close();
  }, [patientId]);

  // 🧠 Analyse IA locale
  const analyseIA = () => {
    if (!data) return "Analyse IA indisponible.";
    const { acidite, motricite, inflammation } = data;

    if (acidite < 3)
      return "⚠️ Hyperacidité gastrique. Risque d'ulcère ou reflux gastro-œsophagien.";
    if (acidite > 8) return "⚠️ Hypoacidité : possible trouble digestif ou carence enzymatique.";
    if (inflammation > 70) return "🔥 Inflammation importante détectée. Surveillance rapprochée.";
    if (motricite < 30)
      return "⚠️ Hypomotricité intestinale. Ralentissement digestif à surveiller.";
    return "✅ Système digestif stable. Aucune anomalie détectée par Aetheris IA.";
  };

  const aciditeColor =
    data && data.acidite < 4 ? "#ef4444" : data && data.acidite > 8 ? "#f97316" : "#22c55e";

  // 🌡️ Rendu UI
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">
      {/* 🧭 En-tête */}
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400 flex items-center gap-3">
          🥣 Fonction Digestive — Patient #{patientId}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <CircularProgressbar
                value={data?.acidite ?? 0}
                maxValue={14}
                text={`${safeNumber(data?.acidite)} pH`}
                styles={buildStyles({
                  pathColor: aciditeColor,
                  textColor: aciditeColor,
                  trailColor: "#222",
                })}
              />
              <p className="mt-2 text-sm text-gray-400">Acidité gastrique</p>
            </div>

            <div className="text-center">
              <CircularProgressbar
                value={data?.motricite ?? 0}
                maxValue={100}
                text={`${safeNumber(data?.motricite)} %`}
                styles={buildStyles({
                  pathColor: "#3b82f6",
                  textColor: "#3b82f6",
                  trailColor: "#222",
                })}
              />
              <p className="mt-2 text-sm text-gray-400">Motricité intestinale</p>
            </div>

            <div className="text-center">
              <CircularProgressbar
                value={data?.inflammation ?? 0}
                maxValue={100}
                text={`${safeNumber(data?.inflammation)} %`}
                styles={buildStyles({
                  pathColor: "#ef4444",
                  textColor: "#ef4444",
                  trailColor: "#222",
                })}
              />
              <p className="mt-2 text-sm text-gray-400">Inflammation</p>
            </div>
          </div>

          {/* --- Graphique pH --- */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
              📈 Évolution du pH gastrique
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.historique || []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 14]} />
                <Tooltip contentStyle={{ background: "#111", color: "#fff" }} />
                <Line
                  type="monotone"
                  dataKey="acidite"
                  stroke={aciditeColor}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* --- Schéma digestif réaliste --- */}
          <Card className="p-6 bg-white/50 dark:bg-gray-900/60">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              🧬 Schéma interactif digestif
            </h3>
            <motion.svg
              viewBox="0 0 500 250"
              className="w-full max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Œsophage */}
              <motion.rect
                x="240"
                y="10"
                width="20"
                height="40"
                rx="10"
                fill="#94a3b8"
                animate={{ y: [10, 15, 10] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <text x="270" y="35" fontSize="10" fill="#94a3b8">
                Œsophage
              </text>

              {/* Estomac */}
              <motion.ellipse
                cx="250"
                cy="100"
                rx="80"
                ry="35"
                fill={aciditeColor}
                opacity="0.6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
              <text x="250" y="105" textAnchor="middle" fill="#fff" fontSize="12">
                Estomac
              </text>

              {/* Intestin grêle */}
              <motion.path
                d="M170 140 Q250 200 330 140 T450 140"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="6"
                strokeLinecap="round"
                animate={{ strokeOpacity: [0.4, 0.9, 0.4] }}
                transition={{ repeat: Infinity, duration: 4 }}
              />
              <text x="250" y="190" fontSize="12" fill="#3b82f6">
                Intestin grêle
              </text>

              {/* Côlon */}
              <motion.path
                d="M120 200 Q250 240 380 200"
                fill="none"
                stroke="#22c55e"
                strokeWidth="8"
                opacity="0.4"
                animate={{ strokeOpacity: [0.2, 0.8, 0.2] }}
                transition={{ repeat: Infinity, duration: 4 }}
              />
              <text x="250" y="225" fontSize="12" fill="#22c55e">
                Côlon
              </text>
            </motion.svg>
            <p className="text-xs text-center text-gray-400 mt-3">
              Visualisation anatomique du tube digestif — activité dynamique selon Aetheris IA.
            </p>
          </Card>

          {/* --- Analyse IA --- */}
          <Card className="p-4 bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              💡 <strong>Aetheris IA :</strong> {analyseIA()}
            </p>
          </Card>
        </div>
      ) : (
        <p className="text-center text-gray-400">Aucune donnée digestive disponible.</p>
      )}
    </div>
  );
};

export default DigestivePatientPage;
