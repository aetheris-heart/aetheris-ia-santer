import React from "react";

interface Props {
  alerte: string;
  priorite: "Haute" | "Moyenne" | "Faible";
}

const PatientCritiqueAlerte: React.FC<Props> = ({ alerte, priorite }) => {
  const couleur =
    priorite === "Haute"
      ? "bg-red-600"
      : priorite === "Moyenne"
        ? "bg-orange-500"
        : "bg-yellow-400";

  return (
    <div className={`p-4 ${couleur} text-white rounded-lg shadow-lg animate-pulse`}>
      <h2 className="text-lg font-semibold">🚨 Alerte IA Priorité : {priorite}</h2>
      <p className="text-sm mt-2">{alerte}</p>
    </div>
  );
};

export default PatientCritiqueAlerte;
