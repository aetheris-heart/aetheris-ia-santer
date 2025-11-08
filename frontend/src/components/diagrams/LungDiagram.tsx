import React from "react";
import Tooltip from "@/components/uui/Tooltip";

interface LungDiagramProps {
  zoneInfectee?: string; // ex: "lobe_superieur_gauche"
}

const LungDiagram: React.FC<LungDiagramProps> = ({ zoneInfectee }) => {
  const getColor = (zone: string) =>
    zoneInfectee === zone ? "#e53935" : zone.includes("superieur") ? "#e0f7fa" : "#b2ebf2";

  return (
    <div className="relative w-full max-w-xl mx-auto mt-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-2xl">
      <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">
        🫁 Schéma interactif du système pulmonaire
      </h2>

      <svg
        viewBox="0 0 200 250"
        className="w-full h-auto mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Trachée */}
        <Tooltip label="Trachée">
          <rect x="90" y="10" width="20" height="40" fill="#cfd8dc" rx="5" />
        </Tooltip>
        <line x1="100" y1="50" x2="100" y2="70" stroke="#90a4ae" strokeWidth="4" />

        {/* Lobe supérieur gauche */}
        <Tooltip label="Lobe supérieur gauche">
          <path
            d="M100,70 C70,70 50,100 50,140 C50,160 70,180 90,180"
            fill={getColor("lobe_superieur_gauche")}
            stroke="#006064"
            strokeWidth="2"
          />
        </Tooltip>

        {/* Lobe inférieur gauche */}
        <Tooltip label="Lobe inférieur gauche">
          <path
            d="M90,180 C70,190 60,210 70,230 C80,240 90,240 100,230"
            fill={getColor("lobe_inferieur_gauche")}
            stroke="#006064"
            strokeWidth="2"
          />
        </Tooltip>

        {/* Lobe supérieur droit */}
        <Tooltip label="Lobe supérieur droit">
          <path
            d="M100,70 C130,70 150,100 150,140 C150,160 130,180 110,180"
            fill={getColor("lobe_superieur_droit")}
            stroke="#006064"
            strokeWidth="2"
          />
        </Tooltip>

        {/* Lobe inférieur droit */}
        <Tooltip label="Lobe inférieur droit">
          <path
            d="M110,180 C130,190 140,210 130,230 C120,240 110,240 100,230"
            fill={getColor("lobe_inferieur_droit")}
            stroke="#006064"
            strokeWidth="2"
          />
        </Tooltip>

        {/* Animation cercle si zone infectée */}
        {zoneInfectee && <circle cx="100" cy="180" r="5" fill="red" className="animate-ping" />}
      </svg>

      {/* Affichage de la zone infectée */}
      {zoneInfectee && (
        <p className="text-center text-red-600 dark:text-red-400 mt-2 font-medium">
          🔬 Zone infectée : {zoneInfectee.replace(/_/g, " ")}
        </p>
      )}

      {/* Légende */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#e0f7fa]"></span> Lobe supérieur (normal)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#b2ebf2]"></span> Lobe inférieur (normal)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#e53935] animate-pulse"></span> Zone infectée
        </div>
      </div>
    </div>
  );
};

export default LungDiagram;
