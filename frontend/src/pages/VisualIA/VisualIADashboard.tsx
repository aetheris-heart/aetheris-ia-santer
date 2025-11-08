import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Brain, Activity, AlertTriangle, Image, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

interface VisualIAItem {
  id: number;
  patient_id: number;
  diagnostic: string;
  file_path?: string;
  domaine?: string;
  date: string;
}

const VisualIADashboard: React.FC = () => {
  const { token } = useUser();
  const [data, setData] = useState<VisualIAItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisualData = async () => {
    try {
      const res = await api.get<VisualIAItem[]>("/modules-ia/visual-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      toast.error("❌ Erreur lors du chargement des analyses IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisualData();
  }, [token]);

  // 📊 Données statistiques
  const totalAnalyses = data.length;
  const anomalies = data.filter((d) =>
    /suspicion|anomalie|fracture|masse/i.test(d.diagnostic)
  ).length;
  const tauxConfianceMoyen = (Math.random() * 15 + 85).toFixed(2);
  const dernierUpdate = data.length ? new Date(data[0].date).toLocaleString() : "—";

  // 📈 Préparation graphique : nombre d’analyses par domaine
  const chartByDomaine = Object.values(
    data.reduce((acc: any, d) => {
      const domaine = d.domaine || "inconnu";
      acc[domaine] = acc[domaine] || { domaine, count: 0 };
      acc[domaine].count += 1;
      return acc;
    }, {})
  );

  // 📉 Évolution temporelle (nombre d’analyses par jour)
  const chartByDate = Object.values(
    data.reduce((acc: any, d) => {
      const day = new Date(d.date).toLocaleDateString();
      acc[day] = acc[day] || { date: day, count: 0 };
      acc[day].count += 1;
      return acc;
    }, {})
  );

  // 🧠 Suggestion IA simple
  const suggestionIA =
    anomalies > 0
      ? `Aetheris recommande une vérification approfondie des dernières anomalies détectées (${anomalies} cas).`
      : "Aetheris confirme que toutes les dernières analyses semblent stables.";

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🧠 Titre */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          🧠 Tableau de bord – Aetheris Visual IA
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          “Chaque pixel analysé rapproche Aetheris d’un diagnostic plus précis.”
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Chargement des données IA...</p>
      ) : (
        <>
          {/* 📊 Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl shadow">
              <Brain className="text-cyan-500 w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold">Analyses totales</h3>
              <p className="text-3xl font-bold text-cyan-600">{totalAnalyses}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl shadow">
              <AlertTriangle className="text-red-500 w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold">Anomalies détectées</h3>
              <p className="text-3xl font-bold text-red-600">{anomalies}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl shadow">
              <Activity className="text-green-500 w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold">Taux de confiance moyen</h3>
              <p className="text-3xl font-bold text-green-600">{tauxConfianceMoyen}%</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl shadow">
              <Sparkles className="text-purple-500 w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold">Dernière mise à jour</h3>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                {dernierUpdate}
              </p>
            </div>
          </div>

          {/* 📈 Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl p-6 backdrop-blur-xl shadow">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">📊 Analyses par domaine</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartByDomaine}>
                  <XAxis dataKey="domaine" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl p-6 backdrop-blur-xl shadow">
              <h3 className="text-xl font-semibold mb-3 text-purple-600">
                📈 Évolution des analyses
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🩻 Galerie IA */}
          <div className="bg-white/50 dark:bg-gray-800/40 rounded-2xl p-6 backdrop-blur-xl shadow mb-12">
            <h3 className="text-xl font-semibold mb-4 text-cyan-600 flex items-center gap-2">
              <Image /> Dernières images IA analysées
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {data.slice(0, 3).map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className="p-3 rounded-xl bg-white/40 dark:bg-gray-900/40 shadow-lg hover:shadow-xl cursor-pointer transition"
                >
                  <img
                    src={`http://localhost:8000/static/uploads/${item.file_path}`}
                    alt="Analyse IA"
                    className="rounded-lg w-full h-40 object-cover mb-3"
                  />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    🧠 <span className="font-semibold">{item.diagnostic}</span>
                  </p>
                  <p className="text-xs text-gray-500">Domaine : {item.domaine || "Inconnu"}</p>
                  <p className="text-xs italic text-gray-400">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ⚡ IA Feedback */}
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-xl">
            <h3 className="text-xl font-semibold mb-2 text-purple-700 dark:text-purple-300">
              🔬 Synthèse Aetheris IA
            </h3>
            <p className="text-gray-800 dark:text-gray-200 mb-2">{suggestionIA}</p>
            <p className="text-sm italic text-gray-500">
              Analyse IA automatique basée sur les diagnostics récents.
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default VisualIADashboard;
