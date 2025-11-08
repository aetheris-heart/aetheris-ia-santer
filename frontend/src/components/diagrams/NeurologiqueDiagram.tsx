import React from "react";
const cerveauImage = "/assets/brain.png";

interface NeurologiqueDiagramProps {
  eeg: number;
  stress_level: number;
}

const NeurologiqueDiagram: React.FC<NeurologiqueDiagramProps> = ({ eeg, stress_level }) => {
  const getEEGColor = () => {
    if (eeg > 80) return "#f43f5e"; // activité intense
    if (eeg > 50) return "#facc15"; // activité modérée
    return "#10b981"; // activité normale
  };

  const getStressLabel = () => {
    if (stress_level > 80) return "Élevé";
    if (stress_level > 50) return "Modéré";
    return "Faible";
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-700 dark:text-purple-300">
        🧠 Activité neurologique en temps réel
      </h2>

      {/* Image cerveau */}
      <div className="relative w-full flex justify-center items-center">
        <img
          src={cerveauImage}
          alt="Cerveau neurologique"
          className="w-full max-w-[600px] object-contain"
        />

        {/* Points clignotants stratégiques */}
        <div className="absolute top-[30%] left-[43%] w-4 h-4 bg-red-500 rounded-full animate-ping" />
        <div className="absolute top-[48%] left-[60%] w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute top-[65%] left-[38%] w-4 h-4 bg-green-500 rounded-full animate-ping" />
      </div>

      {/* Valeurs analysées */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-gray-800 dark:text-gray-200">
        <p>
          <span className="font-semibold">Activité EEG :</span> {eeg}% –{" "}
          <span style={{ color: getEEGColor() }} className="font-bold">
            {eeg > 80 ? "Intense" : eeg > 50 ? "Modérée" : "Normale"}
          </span>
        </p>
        <p>
          <span className="font-semibold">Stress détecté :</span> {stress_level}% (
          <span className="italic">{getStressLabel()}</span>)
        </p>
      </div>

      {/* Légende colorée */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#10b981]"></span> Activité normale
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#facc15]"></span> Activité modérée
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#f43f5e]"></span> Activité intense
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-red-500"></span> Zone critique
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-yellow-400"></span> Zone de vigilance
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-500"></span> Zone stable
        </div>
      </div>
    </div>
  );
};

export default NeurologiqueDiagram;
