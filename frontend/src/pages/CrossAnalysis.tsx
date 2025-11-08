import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { Card, CardContent } from "@/components/uui/ui_card";
import { toast } from "react-toastify";
import { FaHeart, FaBrain } from "react-icons/fa";
import { GiStomach, GiBodyHeight, GiKidneys } from "react-icons/gi";
import { BsGraphUpArrow } from "react-icons/bs";
import { GiLungs } from "react-icons/gi";

interface CardiaqueData {
  frequence_cardiaque: number;
  alerte: string;
}

interface DigestiveData {
  temperature: number;
  alerte: string;
}

interface NeurologiqueData {
  spo2: number;
  alerte: string;
}

interface MetaboliqueData {
  glycemie: number;
  alerte: string;
}

interface PulmonaireData {
  frequence_respiratoire: number;
  alerte: string;
}

interface RenalData {
  creatinine: number;
  alerte: string;
}

interface CrossAnalysisData {
  cardiaque: CardiaqueData;
  digestive: DigestiveData;
  neurologique: NeurologiqueData;
  metabolique: MetaboliqueData;
  pulmonaire: PulmonaireData;
  renal: RenalData;
}

const CrossAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CrossAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCrossAnalysis = async () => {
    try {
      const res = await api.get<CrossAnalysisData>("/aetheris/cross-analysis");
      setData(res.data);
    } catch (err) {
      console.error("Erreur chargement analyse croisée:", err);
      toast.error("❌ Erreur lors de la récupération des données IA.");
    }
  };

  const handleRunAnalysis = async () => {
    try {
      await api.post("/aetheris/cross-analysis/run");
      toast.success("✅ Nouvelle analyse IA relancée avec succès !");
      fetchCrossAnalysis();
    } catch (err) {
      console.error("Erreur relance analyse croisée:", err);
      toast.error("❌ Échec de la relance de l'analyse IA.");
    }
  };

  useEffect(() => {
    fetchCrossAnalysis();
  }, []);

  if (!data) {
    return <p className="text-center text-gray-500">Chargement des données IA...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🔬 Analyse Croisée IA</h1>

        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl"
          >
            ⬅ Retour au Tableau de Bord
          </button>
          <button
            onClick={handleRunAnalysis}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl"
          >
            🔁 Relancer l'Analyse IA
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600">
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <FaHeart className="text-red-500" size={24} />
                <h2 className="font-bold text-lg">Cardiaque</h2>
              </div>
              <p>Fréquence cardiaque : {data.cardiaque.frequence_cardiaque} bpm</p>
              <p>Alerte : {data.cardiaque.alerte}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-600">
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <GiStomach className="text-yellow-500" size={24} />
                <h2 className="font-bold text-lg">Digestive</h2>
              </div>
              <p>Température : {data.digestive.temperature} °C</p>
              <p>Alerte : {data.digestive.alerte}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600">
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <FaBrain className="text-blue-500" size={24} />
                <h2 className="font-bold text-lg">Neurologique</h2>
              </div>
              <p>SpO₂ : {data.neurologique.spo2} %</p>
              <p>Alerte : {data.neurologique.alerte}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-600">
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <BsGraphUpArrow className="text-purple-500" size={24} />
                <h2 className="font-bold text-lg">Métabolique</h2>
              </div>
              <p>Glycémie : {data.metabolique.glycemie} g/L</p>
              <p>Alerte : {data.metabolique.alerte}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-cyan-300 dark:border-cyan-600">
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <GiLungs className="text-cyan-500" size={24} />
                <h2 className="font-bold text-lg">Pulmonaire</h2>
              </div>
              <p>Fréquence respiratoire : {data.pulmonaire.frequence_respiratoire} cpm</p>
              <p>Alerte : {data.pulmonaire.alerte}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-600">
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <GiKidneys className="text-green-500" size={24} />
                <h2 className="font-bold text-lg">Rénale</h2>
              </div>
              <p>Créatinine : {data.renal.creatinine} mg/dL</p>
              <p>Alerte : {data.renal.alerte}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CrossAnalysisPage;
