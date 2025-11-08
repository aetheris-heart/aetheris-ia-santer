import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartPulse, Activity, AlertTriangle, ArrowLeft, Waves } from "lucide-react";
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
import CardiaqueDiagram from "@/components/diagrams/CardiaqueDiagram";

const coeurImage = "/assets/coeur.png";

interface CardiaqueData {
  frequence_cardiaque?: number;
  rythme?: string;
  tension_systolique?: number;
  tension_diastolique?: number;
  anomalies_detectees?: string;
  alerte?: string;
  created_at?: string;
}

const Cardiaque: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();

  const [data, setData] = useState<CardiaqueData | null>(null);
  const [historique, setHistorique] = useState<{ temps: string; frequence: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Récupération des données cardiaques du backend
  const fetchData = async () => {
    if (!token || !patientId) return;

    try {
      const res = await api.get<CardiaqueData>(`/cardiaque/${patientId}/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);

      // Mise à jour du graphique avec données aléatoires réalistes
      setHistorique((prev) => [
        ...prev.slice(-19),
        { temps: new Date().toLocaleTimeString(), frequence: res.data.frequence_cardiaque ?? 0 },
      ]);

      if (res.data.alerte) {
        toast.warn(`⚠️ ${res.data.alerte}`, { position: "top-right", autoClose: 4000 });
      }
    } catch (err) {
      toast.error("❌ Erreur de récupération des données cardiaques");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        ⏳ Chargement des données cardiaques...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-400">
        ❌ Aucune donnée cardiaque trouvée pour ce patient.
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-red-700 rounded-full text-white hover:scale-105 transition"
        >
          ← Retour
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-8 bg-gradient-to-b from-gray-900/90 via-gray-950/90 to-black/90 text-white backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🩺 En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 flex items-center gap-2">
            <HeartPulse className="animate-pulse" /> Fonction Cardiaque
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Suivi intelligent en temps réel des constantes cardiaques.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-gray-200 transition-all"
        >
          <ArrowLeft size={18} /> Retour
        </button>
      </div>

      {/* 🔹 Bloc indicateurs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-red-400/30 shadow-lg hover:shadow-red-500/20 transition"
          whileHover={{ scale: 1.03 }}
        >
          <div className="flex items-center gap-3">
            <Activity className="text-red-500 animate-pulse" size={28} />
            <div>
              <p className="text-sm text-gray-400">Fréquence cardiaque</p>
              <p className="text-3xl font-bold text-red-400">
                {data.frequence_cardiaque ?? "—"} <span className="text-sm">BPM</span>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-rose-400/30 shadow-lg hover:shadow-rose-500/20 transition"
          whileHover={{ scale: 1.03 }}
        >
          <div className="flex items-center gap-3">
            <Waves className="text-pink-400" size={28} />
            <div>
              <p className="text-sm text-gray-400">Rythme cardiaque</p>
              <p className="text-2xl font-bold text-pink-300">{data.rythme ?? "N/A"}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-gray-400/30 shadow-lg hover:shadow-gray-400/20 transition"
          whileHover={{ scale: 1.03 }}
        >
          <p className="text-sm text-gray-400 mb-2">Pression artérielle</p>
          <p className="text-2xl font-bold text-gray-200">
            {data.tension_systolique ?? "—"}/{data.tension_diastolique ?? "—"} mmHg
          </p>
        </motion.div>
      </div>

      {/* 📈 Graphique d’évolution */}
      <Card className="p-6 backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl mb-8">
        <h2 className="text-lg font-semibold mb-4 text-red-300">
          📊 Évolution du rythme cardiaque
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historique}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="temps" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
            <Line
              type="monotone"
              dataKey="frequence"
              stroke="#ff4d6d"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 🔬 Schéma interactif */}
      <Card className="p-6 backdrop-blur-2xl bg-white/10 border border-red-400/20 shadow-lg">
        <h2 className="text-xl font-semibold text-red-300 mb-4">🧬 Schéma interactif du cœur</h2>
        <CardiaqueDiagram
          frequence={data.frequence_cardiaque}
          rythme={data.rythme}
          alertes={data.alerte ? [data.alerte] : []}
        />
        <div className="w-full h-52 mt-6 overflow-hidden rounded-2xl">
          <img
            src={coeurImage}
            alt="Schéma du cœur"
            className="object-cover w-full h-full opacity-80 hover:opacity-100 transition"
          />
        </div>
      </Card>

      {/* ⚠️ Alertes */}
      {data.alerte && (
        <motion.div
          className="mt-8 p-4 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-300 flex items-center gap-3 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="animate-pulse" /> <span>{data.alerte}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Cardiaque;
