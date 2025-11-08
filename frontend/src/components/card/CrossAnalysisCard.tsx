import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/uui/ui_card";
import { FaHeart, FaBrain } from "react-icons/fa";
import { GiStomach } from "react-icons/gi";
import { BsGraphUpArrow } from "react-icons/bs";

interface CrossAnalysisCardProps {
  patientId: string; // ✅ On définit la prop ici
}

const CrossAnalysisCard: React.FC<CrossAnalysisCardProps> = ({ patientId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/cross-analysis/${patientId}`); // ✅ Redirection en utilisant le patientId
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer hover:scale-[1.03] transition-transform duration-300"
    >
      <Card className="w-full bg-gradient-to-br from-purple-100 via-white to-indigo-200 dark:from-gray-800 dark:to-indigo-900 shadow-xl rounded-3xl p-5 border border-indigo-400 dark:border-indigo-600">
        <CardContent>
          {/* En-tête */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BsGraphUpArrow
                className="text-indigo-600 dark:text-indigo-300 animate-pulse"
                size={24}
              />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Analyse Croisée IA
              </h3>
            </div>
          </div>

          {/* Sections analysées */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaHeart className="text-red-500" />
              <span>Cardiaque</span>
            </div>
            <div className="flex items-center gap-2">
              <GiStomach className="text-yellow-500" />
              <span>Digestive</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBrain className="text-blue-500" />
              <span>Neurologique</span>
            </div>
            <div className="flex items-center gap-2">
              <BsGraphUpArrow className="text-purple-500" />
              <span>Métabolique</span>
            </div>
          </div>

          {/* Note IA */}
          <div className="mt-4 text-center text-sm italic text-indigo-600 dark:text-indigo-300">
            Cliquez pour lancer l’analyse intelligente croisée
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossAnalysisCard;
