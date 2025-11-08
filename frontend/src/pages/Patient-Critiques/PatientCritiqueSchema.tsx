import React from "react";

const PatientCritiqueSchema: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        🧍 Schéma interactif du patient
      </h2>
      <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900 rounded-lg flex items-center justify-center text-xl font-bold text-gray-800 dark:text-white">
        🔬 Zones à surveiller : Cœur ❤️, Poumons 🫁, Température 🌡️
      </div>
    </div>
  );
};

export default PatientCritiqueSchema;
