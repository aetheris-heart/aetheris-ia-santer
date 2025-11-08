import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui/ui_card";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaHeartbeat } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// 🔹 Types
interface HistoriqueCardiaque {
  date: string;
  valeur: number;
}

interface CardiaqueData {
  frequence_cardiaque: number;
  tension_systolique: number;
  tension_diastolique: number;
  anomalies_detectees: string;
  alerte: string;
  historique: HistoriqueCardiaque[];
}

const CardiaquePatientPage: React.FC = () => {
  const { token } = useUser();
  const { patientId } = useParams<{ patientId: string }>();
  const [data, setData] = useState<CardiaqueData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔄 Charger les données cardiaques (HTTP initial)
  useEffect(() => {
    const fetchCardiacData = async () => {
      if (!token || !patientId) return;
      try {
        const res = await api.get<CardiaqueData>(`/cardiaque/${patientId}/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (error) {
        console.error("❌ Erreur récupération données cardiaques :", error);
        toast.error("Impossible de charger les données cardiaques.");
      } finally {
        setLoading(false);
      }
    };
    fetchCardiacData();
    const interval = setInterval(fetchCardiacData, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  // ⚡ WebSocket Live
  useEffect(() => {
    if (!patientId) return;

    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/cardiaque/${patientId}`);

    socket.onopen = () => {
      console.log("🔗 Connexion WebSocket ouverte pour le patient", patientId);
    };

    socket.onmessage = (event) => {
      const liveData = JSON.parse(event.data) as CardiaqueData;
      setData((prev: CardiaqueData | null) => {
        if (!prev) return { ...liveData, historique: [] };

        return {
          ...prev,
          frequence_cardiaque: liveData.frequence_cardiaque,
          tension_systolique: liveData.tension_systolique,
          tension_diastolique: liveData.tension_diastolique,
          anomalies_detectees: liveData.anomalies_detectees,
          alerte: liveData.alerte,
          historique: [
            ...(prev.historique || []),
            {
              date: liveData.alerte ? liveData.alerte : new Date().toISOString(),
              valeur: liveData.frequence_cardiaque,
            },
          ].slice(-15),
        };
      });

      // ⚠️ Détection IA : alerte visuelle immédiate
      if (liveData.frequence_cardiaque < 45 || liveData.frequence_cardiaque > 130) {
        toast.error("🚨 Aetheris IA : Rythme cardiaque critique détecté !");
      }
    };

    socket.onclose = () => {
      console.warn("❌ Connexion WebSocket fermée");
    };

    return () => socket.close();
  }, [patientId]);

  const bpm = data?.frequence_cardiaque ?? 0;
  const isFlatline = bpm <= 0;

  // 🎨 Couleurs dynamiques BPM
  const getBpmColor = (bpm: number) => {
    if (bpm < 60) return "#00bfff";
    if (bpm <= 100) return "#00ff88";
    if (bpm <= 120) return "#ffcc00";
    return "#ff3333";
  };

  // 🧠 Analyse IA
  const analyseIA = () => {
    if (!data) return "Données insuffisantes pour l’analyse IA.";
    const { frequence_cardiaque, tension_systolique, tension_diastolique } = data;
    if (frequence_cardiaque > 120) return "⚠️ Tachycardie détectée. Surveillance accrue requise.";
    if (frequence_cardiaque < 50)
      return "⚠️ Bradycardie possible. Vérifier la perfusion et la conscience.";
    if (tension_systolique > 140)
      return "🩸 Hypertension observée. Surveiller les risques cardiovasculaires.";
    if (tension_diastolique < 60)
      return "🩺 Hypotension détectée. Vérifier hydratation et volume sanguin.";
    return "💖 Rythme cardiaque normal et stable. Aucune anomalie détectée.";
  };

  return (
    <div className="p-6 space-y-8">
      {/* 🔝 En-tête */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-300 flex items-center gap-3">
          <FaHeartbeat className="animate-pulse text-4xl" />
          Moniteur Cardiaque – Aetheris IA
        </h1>
        <button
          onClick={() => navigate(`/dossiers/${patientId}`)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-sm transition"
        >
          ← Retour
        </button>
      </motion.div>

      {/* 🫀 Carte principale */}
      <Card className="bg-gradient-to-b from-gray-900 to-black text-white rounded-3xl shadow-2xl p-6 border border-red-500/30 relative overflow-hidden">
        <CardContent className="relative space-y-10">
          {loading ? (
            <p className="text-center text-gray-400">Chargement des données...</p>
          ) : data ? (
            <>
              {/* 🫀 Cœur animé + ECG */}
              <div className="flex flex-col md:flex-row items-center justify-around gap-10">
                {/* Cœur animé */}
                <motion.div
                  className="w-32 h-32"
                  animate={{
                    scale: bpm > 0 ? [1, 1.15, 1] : 1,
                    boxShadow:
                      bpm > 0
                        ? ["0 0 20px #ff4d4d", "0 0 40px #ff9999", "0 0 20px #ff4d4d"]
                        : "0 0 0 transparent",
                  }}
                  transition={{
                    duration: bpm > 0 ? 60 / bpm : 1.5,
                    repeat: Infinity,
                  }}
                >
                  <svg
                    viewBox="0 0 64 64"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <path
                      d="M32 58s26-15 26-34C58 12 48 4 32 20 16 4 6 12 6 24c0 19 26 34 26 34z"
                      fill={isFlatline ? "#660000" : "#ff3333"}
                      stroke="#ffcccc"
                      strokeWidth="2"
                    />
                  </svg>
                </motion.div>

                {/* ECG */}
                <div className="w-full h-48 bg-black border border-green-400/40 rounded-lg relative overflow-hidden shadow-inner">
                  <svg
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    className="absolute w-full h-full"
                  >
                    <motion.path
                      d={
                        isFlatline
                          ? "M0,10 L100,10"
                          : "M0,10 L10,10 L15,3 L20,17 L25,10 L35,10 L40,5 L45,15 L50,10 L60,10 L65,3 L70,17 L75,10 L85,10 L90,5 L95,15 L100,10"
                      }
                      fill="none"
                      stroke={isFlatline ? "#ff0000" : "#00ff55"}
                      strokeWidth="1.5"
                      animate={{
                        pathLength: [0, 1],
                        opacity: [1, 0.8, 1],
                        x: [0, -10],
                      }}
                      transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: bpm > 0 ? 60 / bpm : 1.2,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-green-300/5 pointer-events-none" />
                </div>
              </div>

              {/* ⚙️ Indicateurs circulaires */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-10">
                <div>
                  <CircularProgressbar
                    value={bpm}
                    maxValue={180}
                    text={`${bpm} bpm`}
                    styles={buildStyles({
                      pathColor: getBpmColor(bpm),
                      textColor: getBpmColor(bpm),
                      trailColor: "#222",
                    })}
                  />
                  <p className="mt-3 text-gray-400 text-sm">Fréquence cardiaque</p>
                </div>

                <div>
                  <CircularProgressbar
                    value={data.tension_systolique}
                    maxValue={200}
                    text={`${data.tension_systolique} mmHg`}
                    styles={buildStyles({
                      pathColor: "#ff884d",
                      textColor: "#ff884d",
                      trailColor: "#222",
                    })}
                  />
                  <p className="mt-3 text-gray-400 text-sm">Tension systolique</p>
                </div>

                <div>
                  <CircularProgressbar
                    value={data.tension_diastolique}
                    maxValue={120}
                    text={`${data.tension_diastolique} mmHg`}
                    styles={buildStyles({
                      pathColor: "#4da6ff",
                      textColor: "#4da6ff",
                      trailColor: "#222",
                    })}
                  />
                  <p className="mt-3 text-gray-400 text-sm">Tension diastolique</p>
                </div>
              </div>

              {/* 📊 Graphique historique */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-gray-300 mb-2 text-center">
                  Évolution du rythme cardiaque
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.historique}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[40, 160]} />
                    <Tooltip contentStyle={{ background: "#111", color: "#fff" }} />
                    <Line
                      type="monotone"
                      dataKey="valeur"
                      stroke="#ff3333"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 🧠 Analyse IA */}
              <motion.div
                className="p-5 bg-red-900/20 border border-red-500/40 rounded-xl mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm italic text-gray-300">
                  💡 <strong>Aetheris IA :</strong> {analyseIA()}
                </p>
              </motion.div>

              {/* Légende */}
              <div className="text-xs text-gray-500 text-center mt-6 space-x-4">
                <span className="text-green-400">● Ligne ECG normale</span>
                <span className="text-yellow-400">● Légère tachycardie</span>
                <span className="text-red-500">● Alerte critique</span>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400">Aucune donnée cardiaque disponible.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CardiaquePatientPage;
