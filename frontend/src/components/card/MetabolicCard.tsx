import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFlask, FaBolt } from "react-icons/fa";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/uui/ui_card";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const metaboliqueImage = "/assets/metabolique.png";

interface Props {
  patientId: number;
}

interface MetaboliqueStats {
  glucose: number;
  insuline: number;
  niveau_risque?: string;
  anomalies_detectees?: string;
  score_sante?: number;
  created_at?: string;
}

const MetaboliqueCard: React.FC<Props> = ({ patientId }) => {
  const { token } = useUser();
  const [data, setData] = useState<MetaboliqueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 Récupération des données métaboliques
  useEffect(() => {
    if (!token || !patientId) return;

    const fetchMetaboliqueStats = async () => {
      try {
        const response = await api.get<MetaboliqueStats>(`/metabolique/${patientId}/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch (error) {
        console.error("❌ Erreur récupération données métaboliques :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetaboliqueStats();
    const interval = setInterval(fetchMetaboliqueStats, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  // 🎨 Couleur dynamique selon le risque IA
  const riskColor = useMemo(() => {
    switch (data?.niveau_risque) {
      case "Critique":
        return "#dc2626"; // rouge
      case "Élevé":
        return "#f97316"; // orange
      case "Modéré":
        return "#facc15"; // jaune
      default:
        return "#22c55e"; // vert
    }
  }, [data?.niveau_risque]);

  // 📈 Préparation du graphique (ex : variation glucose)
  const chartData = data
    ? [
        { label: "Glucose", value: data.glucose },
        { label: "Insuline", value: data.insuline },
      ]
    : [];

  // 🧭 Navigation vers la page détaillée
  const handleClick = () => {
    navigate(`/metabolique/${patientId}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer relative"
    >
      {/* Halo IA animé */}
      <motion.div
        className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl"
        style={{ background: `${riskColor}40` }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <Card className="w-full relative bg-gradient-to-br from-lime-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-xl rounded-3xl border border-lime-400 dark:border-green-600 overflow-hidden">
        <CardContent className="relative z-10 p-5">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaFlask size={26} className="text-green-600" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Fonction Métabolique
              </h3>
            </div>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaBolt className="text-yellow-400" size={20} />
            </motion.div>
          </div>

          {/* Données IA */}
          {loading ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-300">
              Chargement des données...
            </p>
          ) : data ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Glucose</p>
                  <p className="text-xl font-bold text-green-600">
                    {data.glucose.toFixed(1)} mg/dL
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Insuline</p>
                  <p className="text-xl font-bold text-lime-600">
                    {data.insuline.toFixed(1)} µU/mL
                  </p>
                </div>
              </div>

              {/* Score IA et risque */}
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Score santé IA :</p>
                <p className="text-base font-semibold" style={{ color: riskColor }}>
                  {data.score_sante ? `${data.score_sante.toFixed(1)} %` : "–"}
                </p>
              </div>

              {/* Mini graphique simple */}
              <div className="h-20 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value.toFixed(1)}`, name]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={riskColor}
                      fill={`${riskColor}30`}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Alerte IA */}
              {data.anomalies_detectees && (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-300 mt-1">
                  <AlertTriangle size={16} />
                  <span className="italic text-sm">{data.anomalies_detectees}</span>
                </div>
              )}

              {/* Image métabolique */}
              <div className="w-full h-20 overflow-hidden rounded-xl mt-4">
                <img
                  src={metaboliqueImage}
                  alt="Fonction métabolique"
                  className="object-cover w-full h-full opacity-80"
                />
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-gray-400">Aucune donnée disponible</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetaboliqueCard;
