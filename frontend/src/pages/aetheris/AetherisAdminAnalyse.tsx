import React, { useEffect, useState } from "react";
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
import { Brain, Activity, AlertTriangle, TrendingUp, Loader2, ArrowLeftCircle } from "lucide-react";
import { Card, CardContent } from "@/components/uui/ui_card";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface IAAnalyse {
  score_global: number;
  fiabilite: number;
  anomalies_detectees: number;
  tendance: string;
  historique: { mois: string; score: number }[];
}

const AetherisAdminAnalyse: React.FC = () => {
  const { token } = useUser();
  const [data, setData] = useState<IAAnalyse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyse = async () => {
      try {
        const res = await api.get("/aetheris/analysis", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Erreur chargement analyse IA :", err);
        toast.error("Impossible de récupérer l'analyse Aetheris IA");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAnalyse();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-yellow-400">
        <Loader2 className="animate-spin mr-3" /> Chargement de l’analyse IA...
      </div>
    );
  }

  return (
    <div className="relative p-10 min-h-screen text-white overflow-hidden">
      {/* 🌫️ Fond effet miroir & vagues lumineuses */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-200/10 via-gray-300/10 to-gray-100/5 backdrop-blur-3xl"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: "400% 400%",
          zIndex: 0,
        }}
      />

      {/* 🌊 Vagues mouvantes */}
      <motion.div
        className="absolute inset-0 opacity-25"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2), transparent 60%)",
            "radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15), transparent 60%)",
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 60%)",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ zIndex: 0 }}
      />

      {/* CONTENU */}
      <div className="relative z-10 space-y-10">
        <motion.h1
          className="text-4xl font-extrabold text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🧠 AETHERIS IA — Analyse Système
        </motion.h1>

        {/* 📊 Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/70 border border-yellow-600 rounded-2xl shadow-xl">
            <CardContent className="flex flex-col items-center p-6">
              <Brain className="text-yellow-400 w-10 h-10 mb-2" />
              <p className="text-gray-400 text-sm">Score Global</p>
              <p className="text-4xl font-bold text-yellow-500">{data?.score_global ?? "--"}%</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/70 border border-green-600 rounded-2xl shadow-xl">
            <CardContent className="flex flex-col items-center p-6">
              <Activity className="text-green-400 w-10 h-10 mb-2" />
              <p className="text-gray-400 text-sm">Fiabilité du Système</p>
              <p className="text-4xl font-bold text-green-400">{data?.fiabilite ?? "--"}%</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/70 border border-red-600 rounded-2xl shadow-xl">
            <CardContent className="flex flex-col items-center p-6">
              <AlertTriangle className="text-red-500 w-10 h-10 mb-2" />
              <p className="text-gray-400 text-sm">Anomalies Détectées</p>
              <p className="text-4xl font-bold text-red-400">{data?.anomalies_detectees ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* 📈 Graphique d'évolution */}
        <Card className="bg-gray-900/80 border border-yellow-700 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-yellow-500">
            <TrendingUp className="text-yellow-500" /> Évolution du Score IA
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.historique || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mois" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #555",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#facc15"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 🩺 Analyse textuelle */}
        <motion.div
          className="bg-gray-900/70 border border-yellow-600 p-6 rounded-2xl shadow-lg backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-yellow-400 mb-3">
            🩺 Analyse contextuelle Aetheris
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Le système Aetheris IA évalue en continu les performances globales et la cohérence des
            modules cliniques. La tendance actuelle est <b>{data?.tendance || "stable"}</b>, avec un
            taux de fiabilité moyen de <b>{data?.fiabilite}%</b>. Les anomalies détectées
            proviennent principalement de fluctuations de données patients, et sont automatiquement
            corrélées aux alertes IA santé. Une réévaluation complète sera effectuée toutes les 24h.
          </p>
        </motion.div>

        {/* 🧭 Bouton retour vers le tableau de bord admin */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/admin")}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black font-bold rounded-xl shadow-md hover:shadow-yellow-500/40 hover:scale-105 transition-all duration-500 backdrop-blur-xl flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeftCircle className="w-5 h-5" /> Retour au Tableau de bord Administrateur
          </button>
        </div>
      </div>
    </div>
  );
};

export default AetherisAdminAnalyse;
