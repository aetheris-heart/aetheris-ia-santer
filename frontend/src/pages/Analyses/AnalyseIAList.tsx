import React from "react";
import type { AnalyseIA } from "@/types/analyseIA";
import { Card, CardContent } from "@/components/uui";
import { FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface AnalyseIAListProps {
  analyses: AnalyseIA[];
  showPatient?: boolean; // optionnel, pour afficher infos patient si besoin
}

const AnalyseIAList: React.FC<AnalyseIAListProps> = ({ analyses, showPatient = false }) => {
  const navigate = useNavigate();

  if (!analyses.length) {
    return (
      <p className="text-gray-600 dark:text-gray-400 italic">❌ Aucune analyse IA disponible</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {analyses.map((analyse) => (
        <Card
          key={analyse.id}
          onClick={() => navigate(`/analyse-ia/detail/${analyse.id}`)}
          className="cursor-pointer bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl 
                     border border-white/20 shadow-lg hover:scale-[1.02] transition"
        >
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <FaClock /> {new Date(analyse.created_at).toLocaleString()}
              </span>
              {analyse.type_analyse && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold 
                             bg-blue-500/20 text-blue-600 dark:text-blue-400"
                >
                  {analyse.type_analyse}
                </span>
              )}
            </div>

            <p className="text-gray-900 dark:text-gray-100 font-medium">📝 {analyse.description}</p>

            {analyse.score !== undefined && analyse.score !== null && (
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                📊 Score IA : {analyse.score}
              </p>
            )}

            {analyse.observations && (
              <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                🔍 {analyse.observations}
              </p>
            )}

            {showPatient && analyse.patient && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                👤 {analyse.patient.prenom} {analyse.patient.nom}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyseIAList;
