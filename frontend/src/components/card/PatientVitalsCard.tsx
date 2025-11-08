import React from "react";

interface PatientVitalsCardProps {
  spo2: number;
  rythme_cardiaque: number;
  temperature: number;
}

const PatientVitalsCard: React.FC<PatientVitalsCardProps> = ({
  spo2,
  rythme_cardiaque,
  temperature,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Saturation */}
      <div
        className={`p-4 rounded-xl shadow-md ${spo2 < 90 ? "bg-red-500/20" : "bg-green-500/20"}`}
      >
        <h3 className="text-lg font-bold mb-2">SpO₂</h3>
        <p className="text-2xl">{spo2}%</p>
        {spo2 < 90 && <p className="text-sm text-red-500">Hypoxémie !</p>}
      </div>

      {/* Rythme cardiaque */}
      <div
        className={`p-4 rounded-xl shadow-md ${rythme_cardiaque > 120 || rythme_cardiaque < 50 ? "bg-red-500/20" : "bg-blue-500/20"}`}
      >
        <h3 className="text-lg font-bold mb-2">Rythme Cardiaque</h3>
        <p className="text-2xl">{rythme_cardiaque} bpm</p>
        {(rythme_cardiaque > 120 || rythme_cardiaque < 50) && (
          <p className="text-sm text-red-500">Trouble du rythme !</p>
        )}
      </div>

      {/* Température */}
      <div
        className={`p-4 rounded-xl shadow-md ${temperature > 39 || temperature < 35 ? "bg-red-500/20" : "bg-yellow-500/20"}`}
      >
        <h3 className="text-lg font-bold mb-2">Température</h3>
        <p className="text-2xl">{temperature}°C</p>
        {(temperature > 39 || temperature < 35) && (
          <p className="text-sm text-red-500">Température anormale !</p>
        )}
      </div>
    </div>
  );
};

export default PatientVitalsCard;
