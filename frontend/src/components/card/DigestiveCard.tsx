import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/uui/ui_card";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  patientId: number;
}

interface DigestiveStats {
  acidite?: number;
  motricite?: number;
  inflammation?: number;
  alerte?: string;
  score_sante?: number;
  historique_acidite?: { date: string; valeur: number }[];
  created_at?: string;
}

const DigestiveCard: React.FC<Props> = ({ patientId }) => {
  const { token } = useUser();
  const [data, setData] = useState<DigestiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 Récupération des données digestives
  useEffect(() => {
    if (!token || !patientId) return;

    const fetchDigestiveStats = async () => {
      try {
        const response = await api.get<DigestiveStats>(`/digestive/${patientId}/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch (error) {
        console.error("❌ Erreur récupération données digestives :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDigestiveStats();
    const interval = setInterval(fetchDigestiveStats, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  // 🧠 Normalisation
  const normalized = data
    ? {
        acidite: data.acidite ?? 0,
        motricite: data.motricite ?? 0,
        inflammation: data.inflammation ?? 0,
        score_sante: data.score_sante ?? 0,
        alerte: data.alerte ?? "",
        historique_acidite: data.historique_acidite ?? [],
      }
    : null;

  // 🎨 Couleur dynamique selon acidité
  const aciditeColor = useMemo(() => {
    if (!normalized) return "#f97316";
    if (normalized.acidite < 4) return "#dc2626"; // acide fort
    if (normalized.acidite < 6) return "#ea580c"; // modéré
    if (normalized.acidite <= 8) return "#22c55e"; // neutre
    return "#9333ea"; // basique
  }, [normalized?.acidite]);

  // 📊 Données du mini graphique
  const chartData =
    normalized?.historique_acidite?.map((h) => ({
      time: new Date(h.date).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: h.valeur,
    })) || [];

  // 🧭 Navigation vers la page détaillée
  const handleClick = () => {
    navigate(`/digestive/${patientId}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      className="cursor-pointer transition-transform duration-300"
    >
      <Card className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-yellow-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-xl border border-orange-300 dark:border-orange-700">
        {/* Halo lumineux IA */}
        <motion.div
          className="absolute top-0 left-0 w-56 h-56 bg-orange-400/20 blur-3xl rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <CardContent>
          {/* En-tête */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <FaHeartbeat className="text-orange-600 text-2xl" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Fonction Digestive
              </h3>
            </div>
            {normalized && (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Score IA :{" "}
                <span
                  className={`font-bold ${
                    normalized.score_sante > 80
                      ? "text-green-600"
                      : normalized.score_sante > 60
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {normalized.score_sante.toFixed(1)}%
                </span>
              </p>
            )}
          </div>

          {/* Contenu principal */}
          {loading ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Chargement des données...
            </p>
          ) : normalized ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Acidité</p>
                  <p className="text-xl font-semibold" style={{ color: aciditeColor }}>
                    {Number(normalized.acidite || 0).toFixed(2)} pH
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Motricité</p>
                  <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                    {Number(normalized.motricite || 0).toFixed(1)} mm/s
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inflammation</p>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                    {Number(normalized.inflammation || 0).toFixed(1)} %
                  </p>
                </div>
              </div>

              {/* Mini graphique */}
              {chartData.length > 0 && (
                <div className="h-24 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={aciditeColor}
                        fill={`${aciditeColor}40`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Alerte IA */}
              {normalized.alerte && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mt-2"
                >
                  <AlertTriangle size={16} />
                  <span className="italic text-sm">{normalized.alerte}</span>
                </motion.div>
              )}
            </>
          ) : (
            <p className="text-center text-sm text-gray-400">Aucune donnée disponible</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DigestiveCard;
