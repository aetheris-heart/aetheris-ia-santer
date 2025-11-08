import React from "react";
const lungsImage = "/assets/poumons.png";

interface PulmonaireDiagramProps {
  spo2: number;
  respiration_rate: number;
  zoneInfectee?: string;
}

const PulmonaireDiagram: React.FC<PulmonaireDiagramProps> = ({
  spo2,
  respiration_rate,
  zoneInfectee,
}) => {
  const getSpo2Color = () => {
    if (spo2 >= 95) return "text-green-500";
    if (spo2 >= 90) return "text-yellow-500";
    return "text-red-600";
  };

  const getRespirationStatus = () => {
    if (respiration_rate >= 12 && respiration_rate <= 20) return "Normale";
    if (respiration_rate < 12) return "Lente";
    return "Rapide";
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-900 dark:to-gray-900 p-6 rounded-2xl shadow-2xl">
      <h3 className="text-2xl font-bold text-teal-700 dark:text-teal-300 mb-4">
        🫁 Vue pulmonaire simplifiée
      </h3>

      {/* 🖼️ Image réaliste des poumons avec points interactifs */}
      <div className="relative w-full max-w-2xl mx-auto">
        <img
          src={lungsImage}
          alt="Illustration poumons"
          className="w-full h-auto rounded-xl shadow-lg"
        />

        {/* Points clignotants */}
        <div className="absolute top-[28%] left-[38%]">
          <div className="w-4 h-4 rounded-full bg-yellow-400 animate-ping"></div>
        </div>
        <div className="absolute top-[50%] left-[58%]">
          <div className="w-4 h-4 rounded-full bg-red-500 animate-ping"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Saturation O₂</p>
          <p className={`text-3xl font-extrabold ${getSpo2Color()}`}>{spo2} %</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Respiration</p>
          <p className="text-3xl font-extrabold text-blue-600">{respiration_rate} /min</p>
          <p className="text-sm mt-1 text-gray-500 italic">{getRespirationStatus()}</p>
        </div>
      </div>

      {zoneInfectee && (
        <p className="text-center text-red-600 dark:text-red-400 mt-4 font-medium">
          🔬 Zone infectée : {zoneInfectee.replace(/_/g, " ")}
        </p>
      )}
    </div>
  );
};

export default PulmonaireDiagram;
