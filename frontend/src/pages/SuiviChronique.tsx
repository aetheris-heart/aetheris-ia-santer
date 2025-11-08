import React from "react";
import { motion } from "framer-motion";

const SuiviChronique: React.FC = () => {
  return (
    <motion.div
      className="p-8 text-white bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">🩺 Suivi Chronique</h1>
      <p className="text-gray-300 text-lg text-center">
        Cette page affichera le suivi en temps réel des pathologies chroniques des patients.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4">
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg w-full max-w-3xl">
          <h2 className="text-xl font-semibold text-blue-300 mb-2">Suivi glycémique</h2>
          <p className="text-gray-400">Analyse de la glycémie moyenne sur les 30 derniers jours.</p>
        </div>

        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg w-full max-w-3xl">
          <h2 className="text-xl font-semibold text-green-300 mb-2">Suivi tensionnel</h2>
          <p className="text-gray-400">Surveillance de la pression artérielle en temps réel.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SuiviChronique;
