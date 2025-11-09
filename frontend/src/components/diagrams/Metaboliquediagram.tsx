import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Activity, Droplet } from "lucide-react";

interface Props {
  glucose: number;
  insuline: number;
  niveau_risque?: string;
   image?: string;
  niveauRisque?: string;
}

/**
 * Diagramme IA — Fonction métabolique Aetheris
 * Représente le métabolisme énergétique avec animation et visualisation IA.
 */
const MetaboliqueDiagram: React.FC<Props> = ({ glucose, insuline, niveauRisque }) => {
  // 🧠 Couleur du risque
  const colorRisque = useMemo(() => {
    switch (niveauRisque) {
      case "Critique":
        return "#dc2626";
      case "Élevé":
        return "#ea580c";
      case "Modéré":
        return "#facc15";
      default:
        return "#22c55e";
    }
  }, [niveauRisque]);

  // 🔬 Intensité du halo IA selon équilibre métabolique
  const haloIntensity = useMemo(() => {
    const ratio = Math.min(glucose / 150, 1);
    return ratio * 0.7 + 0.3;
  }, [glucose]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-lg border border-emerald-300 dark:border-emerald-700 overflow-hidden">
      {/* Halo IA */}
      <motion.div
        className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl"
        style={{
          background: `${colorRisque}40`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [haloIntensity, haloIntensity * 1.3, haloIntensity],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Schéma central */}
      <motion.svg
        width="260"
        height="220"
        viewBox="0 0 260 220"
        xmlns="http://www.w3.org/2000/svg"
        className="z-10"
      >
        {/* Cellule */}
        <motion.circle
          cx="130"
          cy="110"
          r="80"
          stroke="#34d399"
          strokeWidth="2"
          fill="none"
          animate={{
            strokeDasharray: [5, 10, 15],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Flèches de glucose vers cellule */}
        <motion.path
          d="M50 110 Q90 80 130 110"
          stroke="#f59e0b"
          strokeWidth="3"
          fill="none"
          animate={{
            pathLength: [0, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.path
          d="M50 110 Q90 140 130 110"
          stroke="#f59e0b"
          strokeWidth="3"
          fill="none"
          animate={{
            pathLength: [0, 1],
          }}
          transition={{ duration: 3, delay: 1.5, repeat: Infinity }}
        />

        {/* Flèches d’insuline vers membrane */}
        <motion.path
          d="M210 110 Q170 70 130 110"
          stroke="#3b82f6"
          strokeWidth="3"
          fill="none"
          animate={{
            pathLength: [0, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Centre énergétique */}
        <motion.circle
          cx="130"
          cy="110"
          r="25"
          fill="#10b981"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Points lumineux (représentation ATP / énergie) */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 130 + 40 * Math.cos(rad);
          const y = 110 + 40 * Math.sin(rad);
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill={colorRisque}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          );
        })}
      </motion.svg>

      {/* Légende médicale IA */}
      <div className="z-10 mt-4 grid grid-cols-3 text-center gap-4">
        <div className="flex flex-col items-center">
          <Droplet className="text-yellow-500 mb-1" size={20} />
          <p className="text-xs text-gray-500 dark:text-gray-400">Glucose</p>
          <p className="text-sm font-semibold text-yellow-600">{glucose.toFixed(1)} mg/dL</p>
        </div>
        <div className="flex flex-col items-center">
          <Activity className="text-blue-500 mb-1" size={20} />
          <p className="text-xs text-gray-500 dark:text-gray-400">Insuline</p>
          <p className="text-sm font-semibold text-blue-600">{insuline.toFixed(1)} µU/mL</p>
        </div>
        <div className="flex flex-col items-center">
          <Flame className="text-emerald-600 mb-1" size={20} />
          <p className="text-xs text-gray-500 dark:text-gray-400">Risque IA</p>
          <p className="text-sm font-semibold" style={{ color: colorRisque }}>
            {niveauRisque ?? "Stable"}
          </p>
        </div>
      </div>

      {/* Signature Aetheris */}
      <div className="absolute bottom-3 right-4 text-[10px] text-gray-500 dark:text-gray-400 italic">
        Analyse IA — Aetheris Metabolic Engine
      </div>
    </div>
  );
};

export default MetaboliqueDiagram;
