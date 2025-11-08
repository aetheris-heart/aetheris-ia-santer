import React, { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui/ui_card";
import { motion } from "framer-motion";
import { FaCheckCircle, FaClock, FaExclamationTriangle, FaXRay } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "react-toastify";

interface RadiologieOverview {
  total_examens: number;
  examens_valides: number;
  en_attente: number;
  risques_eleves: number;
  taux_validation: number;
  taux_risque: number;
}

const COLORS = ["#10B981", "#FBBF24", "#EF4444"];

const RadiologieOverview: React.FC = () => {
  const { token } = useUser();
  const [stats, setStats] = useState<RadiologieOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await api.get<RadiologieOverview>("/radiologie/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("❌ Erreur récupération statistiques radiologiques :", error);
      toast.error("Erreur lors du chargement des statistiques radiologiques.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500 dark:text-gray-300">
        Chargement des données radiologiques...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center mt-20 text-gray-400">Aucune donnée radiologique disponible.</div>
    );
  }

  const pieData = [
    { name: "Validés", value: stats.examens_valides },
    { name: "En attente", value: stats.en_attente },
    { name: "Risque élevé", value: stats.risques_eleves },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-6 text-gray-900 dark:text-gray-100">
      <motion.h1
        className="text-3xl font-bold mb-8 text-blue-700 dark:text-blue-400 flex items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FaXRay className="text-blue-500 text-4xl" />
        Radiologie IA — Vue d’ensemble
      </motion.h1>

      {/* === Statistiques principales === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="bg-green-100/60 dark:bg-green-900/40 text-center">
          <CardContent>
            <FaCheckCircle className="mx-auto text-green-600 text-3xl mb-2" />
            <p className="text-lg font-semibold">Validés</p>
            <p className="text-3xl font-bold">{stats.examens_valides}</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-100/60 dark:bg-yellow-900/40 text-center">
          <CardContent>
            <FaClock className="mx-auto text-yellow-600 text-3xl mb-2" />
            <p className="text-lg font-semibold">En attente</p>
            <p className="text-3xl font-bold">{stats.en_attente}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-100/60 dark:bg-red-900/40 text-center">
          <CardContent>
            <FaExclamationTriangle className="mx-auto text-red-600 text-3xl mb-2" />
            <p className="text-lg font-semibold">Risque élevé</p>
            <p className="text-3xl font-bold">{stats.risques_eleves}</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-100/60 dark:bg-blue-900/40 text-center">
          <CardContent>
            <FaXRay className="mx-auto text-blue-600 text-3xl mb-2" />
            <p className="text-lg font-semibold">Total examens</p>
            <p className="text-3xl font-bold">{stats.total_examens}</p>
          </CardContent>
        </Card>
      </div>

      {/* === Graphique === */}
      <Card className="p-6 bg-white/80 dark:bg-gray-800/70 shadow-md rounded-2xl">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Répartition des examens radiologiques
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} examens`, name]}
              contentStyle={{
                backgroundColor: "#111",
                color: "#fff",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* === Résumé global === */}
      <motion.div
        className="mt-8 text-center text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p>
          ✅ Taux de validation :{" "}
          <span className="font-bold text-green-600">{stats.taux_validation}%</span>
        </p>
        <p>
          ⚠️ Taux de risque : <span className="font-bold text-red-500">{stats.taux_risque}%</span>
        </p>
      </motion.div>
    </div>
  );
};

export default RadiologieOverview;
