import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartPulse, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/uui/ui_card";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import axios from "axios";

interface Props {
  patientId?: number;
}

interface CardiaqueData {
  frequence_cardiaque?: number;
  rythme?: string;
  tension_systolique?: number;
  tension_diastolique?: number;
  anomalies_detectees?: string;
  alerte?: string;
  created_at?: string;
}

const CardioCard: React.FC<Props> = ({ patientId = 1 }) => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState<CardiaqueData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Récupération automatique des données cardiaques
  useEffect(() => {
  if (!token) return;

  const fetchCardiaque = async (): Promise<void> => {
    if (!patientId) {
      console.warn("⚠️ patientId non défini pour CardioCard");
      return;
    }

    try {
      const res = await api.get<CardiaqueData>(`/cardiaque/${patientId}/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Données cardiaques :", res.data);
      setData(res.data);
    } catch (error) {
      // ✅ Typage strict de l'erreur Axios
      if (axios.isAxiosError(error)) {
        console.error(
          "❌ Erreur récupération données cardiaques :",
          error.response?.data || error.message
        );
      } else {
        console.error("❌ Erreur inattendue :", error);
      }

      setData(null);
    } finally {
      setLoading(false);
    }
  };

  fetchCardiaque();
}, [token, patientId]);


  // 🩺 Navigation vers la page Cardiaque détaillée
  const handleClick = () => {
    navigate(`/cardiaque/${patientId}`);
  };

  // 🎨 Couleur dynamique selon l’état IA
  const getAlertColor = () => {
    if (!data?.alerte) return "text-gray-400";
    if (data.alerte.toLowerCase().includes("stable")) return "text-green-400";
    if (data.alerte.toLowerCase().includes("instable")) return "text-yellow-400";
    return "text-red-500";
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
    >
      <Card className="relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl bg-white/10 dark:bg-gray-900/40 border border-red-400/20 shadow-[0_0_20px_rgba(255,0,0,0.15)] hover:shadow-[0_0_40px_rgba(255,0,0,0.3)] transition-all duration-500">
        <CardContent>
          {/* 🩸 En-tête */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-red-500 dark:text-red-400 flex items-center gap-2">
              <HeartPulse className="animate-pulse" size={22} /> Fonction Cardiaque
            </h3>
            <span className="text-xs text-gray-400">
              {data?.created_at ? new Date(data.created_at).toLocaleTimeString() : ""}
            </span>
          </div>

          {/* 🧠 Contenu principal */}
          {loading ? (
            <p className="text-center text-gray-400">⏳ Chargement...</p>
          ) : !data ? (
            <p className="text-center text-gray-400 text-sm italic">Aucune donnée disponible</p>
          ) : (
            <>
              <div className="space-y-1 text-sm text-gray-300">
                <p>
                  ❤️ Fréquence :{" "}
                  <span className="font-semibold text-red-400 animate-pulse">
                    {Number(data.frequence_cardiaque ?? 0).toFixed(0)} bpm
                  </span>
                </p>
                <p>
                  🧠 Rythme :{" "}
                  <span className="font-semibold text-rose-300">{data.rythme ?? "N/A"}</span>
                </p>
                <p>
                  💉 Tension :{" "}
                  <span className="font-semibold text-red-300">
                    {data.tension_systolique ?? "—"}/{data.tension_diastolique ?? "—"} mmHg
                  </span>
                </p>

                {/* ⚠️ Anomalie détectée */}
                {data.anomalies_detectees &&
                  data.anomalies_detectees.toLowerCase() !== "aucune" && (
                    <div className="mt-2 flex items-center gap-2 text-yellow-400">
                      <AlertCircle size={16} />
                      <span className="text-sm font-medium">⚠️ {data.anomalies_detectees}</span>
                    </div>
                  )}

                {/* 💬 Alerte IA */}
                <p className={`mt-1 italic font-medium ${getAlertColor()}`}>{data.alerte ?? "—"}</p>
              </div>
            </>
          )}
        </CardContent>

        {/* ✨ Effets visuels IA */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent opacity-50 pointer-events-none" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </Card>
    </motion.div>
  );
};

export default CardioCard;
