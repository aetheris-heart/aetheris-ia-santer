import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { Card, CardContent } from "@/components/uui/ui_card";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FaXRay, FaChevronRight, FaExclamationTriangle } from "react-icons/fa";

interface Radiologie {
  id: number;
  patient_id: number;
  type_examen: string;
  niveau_risque?: string;
  date_examen: string;
  analyse_ia?: string;
}

const RadiologieCard: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [radiologie, setRadiologie] = useState<Radiologie | null>(null);
  const [trend, setTrend] = useState<{ day: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const gradId = useRef(`grad-${Math.random().toString(36).slice(2, 9)}`).current;

  // 📈 Charger le dernier examen radiologique
  const fetchLastExam = async () => {
    try {
      const res = await api.get<Radiologie[]>("/radiologie", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.length > 0) {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.date_examen).getTime() - new Date(a.date_examen).getTime()
        );
        const [radiologies, setRadiologies] = useState<Radiologie[]>([]);

        // et ensuite
        setRadiologies(res.data);

        // Crée une tendance (12 derniers examens)
        const byDay = new Map<string, number>();
        for (const exam of res.data.slice(-12)) {
          const d = new Date(exam.date_examen);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
          ).padStart(2, "0")}`;
          byDay.set(key, (byDay.get(key) ?? 0) + 1);
        }
        setTrend([...byDay.entries()].map(([day, count]) => ({ day, count })));
      } else {
        setRadiologie(null);
      }
    } catch (err) {
      console.error("❌ Erreur récupération Radiologie :", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Auto-refresh toutes les 15 secondes
  useEffect(() => {
    fetchLastExam();
    const interval = setInterval(fetchLastExam, 15000);
    return () => clearInterval(interval);
  }, []);

  const goToDetail = () => navigate(`/radiologie`);

  const colorRisk =
    radiologie?.niveau_risque === "Élevé"
      ? "text-red-500"
      : radiologie?.niveau_risque === "Modéré"
        ? "text-yellow-500"
        : "text-green-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="cursor-pointer rounded-2xl border border-white/20 bg-gradient-to-br from-white/70 to-gray-100/30 dark:from-gray-900/50 dark:to-gray-950/30 shadow-lg hover:shadow-xl transition-all backdrop-blur-xl"
        onClick={goToDetail}
      >
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Icône principale */}
            <div className="relative shrink-0 mt-1">
              <div className="h-12 w-12 grid place-items-center rounded-2xl bg-blue-50/80 dark:bg-blue-900/30 border border-white/30 dark:border-white/10 shadow-inner">
                <FaXRay className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Radiologie IA
                </h3>
                <FaChevronRight className="opacity-70" />
              </div>

              {loading ? (
                <p className="mt-3 text-gray-500 text-sm">Chargement...</p>
              ) : radiologie ? (
                <>
                  <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    <strong>{radiologie.type_examen}</strong> <br />
                    <span className={`font-semibold ${colorRisk}`}>
                      Risque : {radiologie.niveau_risque || "Non défini"}
                    </span>
                    <br />
                    <span className="text-xs opacity-75">
                      {new Date(radiologie.date_examen).toLocaleString("fr-FR")}
                    </span>
                  </div>

                  {/* Mini graphique */}
                  <div className="mt-4 h-20 text-blue-600 dark:text-cyan-400">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <XAxis dataKey="day" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="currentColor"
                          strokeWidth={2}
                          fill={`url(#${gradId})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="mt-3 text-gray-400 text-sm flex items-center gap-2">
                  <FaExclamationTriangle /> Aucun examen enregistré.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RadiologieCard;
