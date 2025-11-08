import React from "react";
const digestiveImage = "/assets/digestif.png";

import Tooltip from "@/components/uui/Tooltip";

interface DigestiveDiagramProps {
  acidite: number;
  motricite: number;
  inflammation: number;
  niveauAlerte?: string;
}

const DigestiveDiagram: React.FC<DigestiveDiagramProps> = ({
  acidite,
  motricite,
  inflammation,
  niveauAlerte,
}) => {
  return (
    <div className="relative w-full bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-2xl">
      <h2 className="text-xl font-bold mb-4 text-yellow-700 dark:text-yellow-300">
        🥣 Schéma interactif du système digestif
      </h2>

      {/* 🖼️ Image réaliste du système digestif */}
      <div className="relative w-full max-w-2xl mx-auto">
        <img
          src={digestiveImage}
          alt="Illustration système digestif"
          className="w-full h-auto rounded-xl shadow-lg"
        />

        {/* Points indicatifs */}
        <div className="absolute top-[22%] left-[45%]">
          <Tooltip label={`Acidité : ${acidite} pH`}>
            <div className="w-5 h-5 rounded-full bg-red-400 animate-pulse"></div>
          </Tooltip>
        </div>
        <div className="absolute top-[45%] left-[48%]">
          <Tooltip label={`Motricité : ${motricite} mm/s`}>
            <div className="w-5 h-5 rounded-full bg-green-500 animate-ping"></div>
          </Tooltip>
        </div>
        <div className="absolute top-[65%] left-[42%]">
          <Tooltip label={`Inflammation : ${inflammation}%`}>
            <div className="w-5 h-5 rounded-full bg-purple-500 animate-bounce"></div>
          </Tooltip>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-sm text-gray-700 dark:text-gray-300">
        <p>
          Acidité gastrique : <span className="font-semibold">{acidite} pH</span>
        </p>
        <p>
          Motricité intestinale : <span className="font-semibold">{motricite} mm/s</span>
        </p>
        <p>
          Inflammation : <span className="font-semibold">{inflammation} %</span>
        </p>
        {niveauAlerte && (
          <p className="mt-2 text-red-600 dark:text-red-400 font-semibold">⚠️ {niveauAlerte}</p>
        )}
      </div>
    </div>
  );
};

export default DigestiveDiagram;
