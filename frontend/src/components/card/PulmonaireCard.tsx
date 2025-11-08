import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/uui/ui_card";
import { Wind, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";

interface PulmonaryStats {
  spo2: number;
  frequence_respiratoire: number;
  alerte?: string | null;
  created_at?: string;
}

const PulmonaireCard: React.FC<{ patientId?: number }> = ({ patientId = 1 }) => {
  const { token } = useUser();
  const [data, setData] = useState<PulmonaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🩺 Récupération des données pulmonaires depuis le backend
  const fetchData = async () => {
    if (!token || !patientId) return;
    try {
      const res = await api.get<PulmonaryStats>(`/pulmonaire/${patientId}/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("❌ Erreur récupération données pulmonaires :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  // 💨 Couleur selon saturation
  const isLow = data?.spo2 !== undefined && data.spo2 < 92;
  const color = isLow ? "text-red-400" : "text-cyan-400";

  // 🧭 Navigation
  const handleClick = () => {
    navigate(`/pulmonaire/${patientId}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
    >
      <Card className="relative bg-gradient-to-br from-gray-900/80 via-gray-950/80 to-black/90 backdrop-blur-xl border border-cyan-500/20 shadow-xl rounded-2xl hover:shadow-cyan-500/30 transition overflow-hidden">
        {/* 🌬 Halo respiratoire animé */}
        <motion.div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl bg-cyan-400/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <CardContent className="p-5 text-gray-200 relative z-10">
          {/* 🔹 En-tête */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
              <Wind className="text-cyan-400 animate-pulse" /> Fonction Pulmonaire
            </h3>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* 🔹 Contenu principal */}
          {loading ? (
            <p className="text-center text-gray-400">Chargement...</p>
          ) : data ? (
            <>
              <div className="text-sm space-y-2">
                <p>
                  <span className="text-gray-400">SpO₂ :</span>{" "}
                  <span className={`${color} font-semibold`}>{data.spo2.toFixed(1)}%</span>
                </p>
                <p>
                  <span className="text-gray-400">Fréquence respiratoire :</span>{" "}
                  <span className="text-cyan-300 font-semibold">
                    {data.frequence_respiratoire.toFixed(1)} insp/min
                  </span>
                </p>
              </div>

              {/* 🔹 Alerte IA ou SpO₂ */}
              {(isLow || data.alerte) && (
                <div className="mt-3 flex items-center gap-2 text-red-400 animate-pulse">
                  <AlertTriangle size={18} />
                  <span className="text-xs">
                    {isLow ? "⚠️ SpO₂ critique détectée" : `⚠️ ${data.alerte}`}
                  </span>
                </div>
              )}

              {/* 🔹 Barre dynamique d'oxygénation */}
              <div className="mt-4 h-2 rounded-full bg-gray-700 overflow-hidden">
                <motion.div
                  className={`h-full ${isLow ? "bg-red-500" : "bg-cyan-500"}`}
                  animate={{ width: `${Math.min(data.spo2, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* 🔹 Légende */}
              <div className="mt-3 text-xs text-right text-cyan-400/80 italic">
                Cliquez pour voir les détails 🫁
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

export default PulmonaireCard;
