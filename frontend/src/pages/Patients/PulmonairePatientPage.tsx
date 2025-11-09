import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/uui/ui_card";
import api from "@/components/lib/axios";
import Tooltip from "@/components/uui/Tooltip";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const poumonsImage = "/assets/poumons.png";

interface PulmonaryStats {
  spo2: number;
  respiration_rate: number;
  history?: { time: string; spo2: number }[];
  alerte?: string;
}

const PulmonairePatientPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PulmonaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 🩺 Récupération initiale
  useEffect(() => {
    const fetchPulmonary = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !patientId) throw new Error("Token ou ID patient manquant");

        const res = await api.get<PulmonaryStats>(`/pulmonary/${patientId}/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch (err) {
        console.error("❌ Erreur récupération pulmonaire :", err);
        toast.error("Impossible de charger les données pulmonaires.");
      } finally {
        setLoading(false);
      }
    };
    fetchPulmonary();
    const interval = setInterval(fetchPulmonary, 15000);
    return () => clearInterval(interval);
  }, [patientId]);

  // 🔁 WebSocket — Données en temps réel
  useEffect(() => {
    if (!patientId) return;
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/pulmonary/${patientId}`);

    socket.onmessage = (event) => {
      const liveData = JSON.parse(event.data) as PulmonaryStats;
      setData((prev) => ({
        ...prev,
        ...liveData,
        history: [
          ...(prev?.history || []),
          { time: new Date().toLocaleTimeString(), spo2: liveData.spo2 },
        ].slice(-25),
      }));

      if (liveData.alerte) toast.warn(`⚠️ ${liveData.alerte}`);
    };

    return () => socket.close();
  }, [patientId]);

  // 🧠 Analyse IA médicale
  const analyseIA = () => {
    if (!data) return "Analyse IA indisponible.";
    const { spo2, respiration_rate } = data;
    if (spo2 < 88) return "🚨 Hypoxémie sévère — oxygénothérapie nécessaire.";
    if (spo2 < 93) return "⚠️ SpO₂ basse — vérifier la ventilation du patient.";
    if (respiration_rate > 24) return "⚠️ Tachypnée — possible détresse respiratoire.";
    if (respiration_rate < 10) return "⚠️ Bradypnée — hypoventilation à surveiller.";
    return "✅ Fonction pulmonaire stable selon Aetheris IA.";
  };

  const spo2Color = data && data.spo2 < 90 ? "#ef4444" : "#3b82f6";
  const respColor =
    data && data.respiration_rate > 25
      ? "#f97316"
      : data && data.respiration_rate < 10
        ? "#facc15"
        : "#22c55e";

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">
      {/* === 🧭 EN-TÊTE === */}
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-3">
          🫁 Fonction Pulmonaire — Patient #{patientId}
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
          {/* === 📊 Valeurs cliniques principales === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="text-center p-6 shadow-md">
              <p className="text-gray-500">SpO₂ (Saturation en oxygène)</p>
              <p className="text-3xl font-bold" style={{ color: spo2Color }}>
                {data.spo2?.toFixed(1)} %
              </p>
            </Card>

            <Card className="text-center p-6 shadow-md">
              <p className="text-gray-500">Fréquence respiratoire</p>
              <p className="text-3xl font-bold" style={{ color: respColor }}>
                {data.respiration_rate?.toFixed(1)} /min
              </p>
            </Card>
          </div>

          {/* === 📈 Évolution du SpO₂ === */}
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
              📈 Courbe de la saturation en oxygène (temps réel)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.history || []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[80, 100]} />
                <RechartsTooltip contentStyle={{ background: "#111", color: "#fff" }} />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke={spo2Color}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* === 🩻 Schéma pulmonaire professionnel === */}
          <Card className="p-6 bg-white/60 dark:bg-gray-900/50 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              🩻 Visualisation Pulmonaire — Schéma Clinique Dynamique
            </h3>

            <div className="relative w-full max-w-4xl mx-auto">
              <img
                src={poumonsImage}
                alt="Schéma pulmonaire médical"
                className="w-full h-auto object-contain rounded-xl opacity-90"
              />

              {/* Poumon gauche */}
              <motion.div
                className="absolute top-[28%] left-[36%] w-8 h-8 rounded-full bg-blue-500/70"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Tooltip label={`Poumon gauche — SpO₂ : ${data.spo2}%`} children={undefined} />
              </motion.div>

              {/* Poumon droit */}
              <motion.div
                className="absolute top-[28%] left-[60%] w-8 h-8 rounded-full bg-green-500/70"
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.3 }}
              >
                <Tooltip label={`Poumon droit — Respiration : ${data.respiration_rate}/min`} children={undefined} />
              </motion.div>

              {/* Trachée + Bronches */}
              <motion.div
                className="absolute top-[12%] left-[48%] w-5 h-20 rounded-full bg-indigo-500/60"
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Tooltip label="Trachée — Conduit principal de l’air inspiré" children={undefined} />
              </motion.div>

              {/* Diaphragme */}
              <motion.div
                className="absolute bottom-[5%] left-[30%] w-[40%] h-3 bg-orange-400/70 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Tooltip label="Mouvement du diaphragme (respiration)" children={undefined} />
              </motion.div>
            </div>

            {/* Légende moderne */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700 dark:text-gray-300 text-center">
              <div className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 rounded-full bg-blue-500"></span> Poumon gauche
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 rounded-full bg-green-500"></span> Poumon droit
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 rounded-full bg-indigo-500"></span> Trachée
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 rounded-full bg-orange-400"></span> Diaphragme
              </div>
            </div>
          </Card>

          {/* === 💡 Analyse IA === */}
          <Card className="p-4 bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 shadow-md">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              💡 <strong>Aetheris IA :</strong> {analyseIA()}
            </p>
          </Card>
        </div>
      ) : (
        <p className="text-center text-gray-400">Aucune donnée pulmonaire disponible.</p>
      )}
    </div>
  );
};

export default PulmonairePatientPage;
