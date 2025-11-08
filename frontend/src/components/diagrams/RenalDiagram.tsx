import React from "react";
const renalImage = "/assets/reins.png";

import Tooltip from "@/components/uui/Tooltip";

export interface RenalDiagramProps {
  tauxFiltration: number;
  creatinine: number;
  urea: number;
  alerte?: string;
}

const RenalDiagram: React.FC<RenalDiagramProps> = ({
  tauxFiltration,
  creatinine,
  urea,
  alerte,
}) => {
  const getColor = () => {
    if (tauxFiltration < 30) return "#dc2626"; // rouge
    if (tauxFiltration < 60) return "#facc15"; // jaune
    return "#10b981"; // vert
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-2xl">
      <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">
        🩸 Schéma interactif de la fonction rénale
      </h2>

      {/* 🖼️ Image réaliste du système rénal */}
      <div className="relative w-full max-w-xl mx-auto">
        <img
          src={renalImage}
          alt="Illustration des reins"
          className="w-full h-auto rounded-xl shadow-lg"
        />

        {/* Points interactifs */}
        <div className="absolute top-[28%] left-[35%]">
          <Tooltip label={`Filtration : ${tauxFiltration} ml/min`}>
            <div
              className="w-5 h-5 rounded-full animate-ping"
              style={{ backgroundColor: getColor() }}
            ></div>
          </Tooltip>
        </div>

        <div className="absolute top-[28%] left-[58%]">
          <Tooltip label={`Créatinine : ${creatinine} µmol/L`}>
            <div className="w-5 h-5 rounded-full bg-blue-500 animate-bounce"></div>
          </Tooltip>
        </div>

        <div className="absolute top-[55%] left-[46%]">
          <Tooltip label={`Urée : ${urea} mg/dL`}>
            <div className="w-5 h-5 rounded-full bg-purple-500 animate-pulse"></div>
          </Tooltip>
        </div>
      </div>

      {/* Données cliniques */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-sm text-gray-700 dark:text-gray-300">
        <p>
          Taux de filtration glomérulaire estimé (eGFR) :{" "}
          <span className="font-semibold">{tauxFiltration} ml/min</span>
        </p>
        <p>
          Créatinine sanguine : <span className="font-semibold">{creatinine} µmol/L</span>
        </p>
        <p>
          Urée sanguine : <span className="font-semibold">{urea} mg/dL</span>
        </p>
        {alerte && <p className="mt-2 text-red-600 dark:text-red-400 font-semibold">⚠️ {alerte}</p>}
      </div>

      {/* Légende */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#10b981]"></span> Filtration normale
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#facc15]"></span> Réduite
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#dc2626]"></span> Insuffisance sévère
        </div>
      </div>
    </div>
  );
};

export default RenalDiagram;
