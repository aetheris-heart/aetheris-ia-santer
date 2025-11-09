import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { FaRobot, FaHeartbeat, FaTools, FaBrain } from "react-icons/fa";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/uui/ui_card";
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from "recharts";

interface AnalyseBlocData {
  complications: string[];
  recommandations: string[];
  statistiques: {
    taux_succès: number;
    temps_moyen_operation: string;
    recuperation_moyenne: string;
  };
  risque_postop?: number;
}

const AnalyseBloc: React.FC = () => {
  const { blocId } = useParams<{ blocId: string }>();
  const { token } = useUser();
  const [analyse, setAnalyse] = useState<AnalyseBlocData | null>(null);

  useEffect(() => {
    const fetchAnalyse = async () => {
      try {
        const res = await api.get<AnalyseBlocData>(`/aetheris/analyse-bloc/${blocId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalyse(res.data);
      } catch (error) {
        console.error("Erreur chargement analyse bloc :", error);
      }
    };
    if (token && blocId) fetchAnalyse();
  }, [token, blocId]);

  if (!analyse)
    return (
      <p className="text-center text-gray-600 dark:text-white animate-pulse mt-10">
        ⚙️ Aetheris IA analyse les données chirurgicales...
      </p>
    );

  const dataRisque = [
    {
      name: "Risque postopératoire",
      value: analyse.risque_postop ?? 22,
      fill:
        (analyse.risque_postop ?? 22) > 75
          ? "#ef4444"
          : (analyse.risque_postop ?? 22) > 50
          ? "#facc15"
          : "#22c55e",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* 🌈 Titre central dynamique */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          Analyse chirurgicale Aetheris IA
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Diagnostic post-opératoire assisté par intelligence médicale prédictive.
        </p>
      </motion.div>

      {/* 🧩 Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🩸 Complications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-xl transition">
            <CardContent>
              <div className="flex items-center gap-3 mb-3 text-red-600">
                <FaHeartbeat className="text-xl" />
                <h2 className="font-bold">Complications potentielles</h2>
              </div>
              <ul className="text-sm list-disc list-inside text-gray-700 dark:text-gray-300">
                {analyse.complications.length > 0 ? (
                  analyse.complications.map((c, i) => <li key={i}>{c}</li>)
                ) : (
                   <li className="text-gray-400 list-none">Aucune complication détectée</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* 🧠 Jauge IA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center items-center"
        >
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
            <CardContent className="text-center">
              <div className="flex flex-col items-center">
                <FaBrain className="text-pink-400 text-3xl mb-2 animate-pulse" />
                <h2 className="font-bold text-lg mb-2">Risque postopératoire</h2>
                <ResponsiveContainer width={180} height={180}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="100%"
                    barSize={12}
                    data={dataRisque}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={20} isAnimationActive={true} />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
                <p className="mt-2 text-sm text-gray-300">
                  Niveau IA :{" "}
                  <span className="font-bold text-pink-400">
                    {analyse.risque_postop ?? 22}%
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ⚙️ Recommandations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-xl transition">
            <CardContent>
              <div className="flex items-center gap-3 mb-3 text-green-600">
                <FaTools className="text-xl" />
                <h2 className="font-bold">Recommandations IA</h2>
              </div>
              <ul className="text-sm list-disc list-inside text-gray-700 dark:text-gray-300">
                {analyse.recommandations.length > 0 ? (
                  analyse.recommandations.map((r, i) => <li key={i}>{r}</li>)
                ) : (
                  <li className="text-gray-400 list-none">Aucune recommandation particulière</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 📊 Statistiques IA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="mt-6">
          <CardContent>
            <div className="flex items-center gap-3 mb-2 text-blue-600">
              <FaRobot className="text-xl" />
              <h2 className="font-bold">Statistiques opératoires</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <p>
                ✅ <strong>Taux de succès :</strong> {analyse.statistiques.taux_succès}%
              </p>
              <p>
                🕒 <strong>Durée moyenne :</strong> {analyse.statistiques.temps_moyen_operation}
              </p>
              <p>
                🛌 <strong>Récupération moyenne :</strong>{" "}
                {analyse.statistiques.recuperation_moyenne}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyseBloc;
