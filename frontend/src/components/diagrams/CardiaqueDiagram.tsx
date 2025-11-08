import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CardiaqueDiagramProps {
  frequence?: number;
  rythme?: string;
  alertes?: string[];
}

const CardiaqueDiagramPremium: React.FC<CardiaqueDiagramProps> = ({
  frequence = 72,
  rythme = "sinusal",
  alertes = [],
}) => {
  const [battement, setBattement] = useState(false);
  const hasAlert = alertes.length > 0;

  // ⏱️ Battement cardiaque
  useEffect(() => {
    const interval = setInterval(() => setBattement((prev) => !prev), 60000 / frequence);
    return () => clearInterval(interval);
  }, [frequence]);

  // 🎨 Couleur selon état
  const couleur = hasAlert
    ? "#ff0033"
    : frequence > 100
      ? "#ff9900"
      : frequence < 50
        ? "#00b3ff"
        : "#00ff99";

  return (
    <div className="relative bg-gradient-to-br from-gray-900/70 to-black/90 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 text-gray-200 shadow-[0_0_25px_rgba(255,255,255,0.05)] overflow-hidden">
      <h2 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
        🫀 Analyse cardiaque IA
      </h2>

      {/* 💗 Cœur animé */}
      <div className="flex justify-center items-center relative">
        <motion.svg
          width="240"
          height="240"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            scale: battement ? 1.1 : 1,
            opacity: battement ? 1 : 0.95,
          }}
          transition={{ duration: 60 / frequence / 2 }}
        >
          {/* Forme du cœur */}
          <motion.path
            d="M100 180 C 40 120, 20 80, 60 50 C 80 35, 100 55, 100 70 C 100 55, 120 35, 140 50 C 180 80, 160 120, 100 180 Z"
            fill={couleur}
            stroke="white"
            strokeWidth="1.8"
            animate={{
              filter: battement
                ? `drop-shadow(0 0 20px ${couleur})`
                : `drop-shadow(0 0 8px ${couleur})`,
            }}
          />

          {/* Courant sanguin périphérique */}
          <motion.circle
            cx="100"
            cy="100"
            r="65"
            stroke={couleur}
            strokeWidth="1.5"
            strokeDasharray="6 15"
            strokeLinecap="round"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          />

          {/* Pulsation externe */}
          <motion.circle
            cx="100"
            cy="100"
            r={battement ? 60 : 68}
            stroke={couleur}
            strokeOpacity="0.3"
            fill="none"
            strokeWidth="2"
          />

          {/* Vaisseaux coronaires stylisés */}
          <motion.path
            d="M100 120 C 110 100, 130 90, 140 70 M100 130 C 90 110, 70 100, 60 80"
            stroke={couleur}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={{
              strokeDasharray: "6 10",
              strokeDashoffset: [0, -30],
            }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 2,
            }}
          />
        </motion.svg>

        {/* ECG animé autour du cœur */}
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[220px] h-[40px]"
          animate={{
            opacity: battement ? 1 : 0.6,
          }}
        >
          <svg viewBox="0 0 400 50" className="w-full h-full">
            <polyline
              points="0,25 40,25 50,10 60,40 70,25 110,25 120,10 130,40 140,25 400,25"
              fill="none"
              stroke={couleur}
              strokeWidth="2"
            >
              <animate
                attributeName="points"
                dur={`${60 / frequence}s`}
                repeatCount="indefinite"
                values="
                  0,25 40,25 50,10 60,40 70,25 110,25 120,10 130,40 140,25 400,25;
                  0,25 35,25 45,10 55,40 65,25 105,25 115,10 125,40 135,25 395,25;
                  0,25 40,25 50,10 60,40 70,25 110,25 120,10 130,40 140,25 400,25"
              />
            </polyline>
          </svg>
        </motion.div>
      </div>

      {/* 🧠 Données IA */}
      <div className="mt-8 bg-white/10 rounded-xl p-4 border border-white/10 text-sm backdrop-blur-xl">
        <p>
          <strong>Fréquence :</strong> <span className="text-red-400">{frequence} bpm</span>
        </p>
        <p>
          <strong>Rythme :</strong> <span className="text-pink-300">{rythme}</span>
        </p>
        {hasAlert ? (
          <p className="text-red-400 mt-2 animate-pulse">
            ⚠️ Alerte : activité cardiaque anormale détectée
          </p>
        ) : (
          <p className="text-green-400 mt-2 italic">✅ Activité cardiaque stable</p>
        )}
      </div>

      {/* Légende médicale */}
      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <p>🟢 Vert — Normal</p>
        <p>🟠 Orange — Tachycardie</p>
        <p>🔵 Bleu — Bradycardie</p>
        <p>🔴 Rouge — Alerte critique</p>
      </div>

      {/* Halo IA esthétique */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-pink-500/5 to-transparent pointer-events-none"
        animate={{ opacity: [0.6, 0.3, 0.6] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />
    </div>
  );
};

export default CardiaqueDiagramPremium;
