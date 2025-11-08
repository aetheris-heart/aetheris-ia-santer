import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui/ui_card";
import { Activity, ArrowLeft, Droplet } from "lucide-react";
const renaleImage = "/assets/reins.png";

import Tooltip from "@/components/uui/Tooltip";
import api from "@/components/lib/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RenaleData {
  clairance: number;
  creatinine: number;
  alertes: string[];
  historique: { time: string; clairance: number; creatinine: number }[];
}

const RenalePatientCritique: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const [data, setData] = useState<RenaleData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<RenaleData>(`/dashboard/patients-critiques/${id}/renale`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (error) {
        console.error("❌ Erreur récupération données rénales :", error);
      }
    };

    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  }, [token, id]);

  if (!data) {
    return (
      <div className="text-center mt-10 text-gray-500 dark:text-gray-400">
        Chargement des données...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-transparent text-gray-900 dark:text-white">
      {/* Bouton retour */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/patients-critiques/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au patient
        </button>
      </div>

      {/* Titre */}
      <h1 className="text-3xl font-bold flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-6">
        <Droplet className="w-7 h-7" /> Fonction Rénale - Patient Critique
      </h1>

      {/* Cartes données */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-purple-300/30">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-300">
              🧪 Clairance rénale
            </h2>
            <p className="text-3xl font-bold">{data.clairance} mL/min</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Créatinine : {data.creatinine} mg/dL
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-purple-300/30">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-300">
              ⚠️ Alertes détectées
            </h2>
            {data.alertes.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1">
                {data.alertes.map((a, i) => (
                  <li key={i} className="text-red-500 dark:text-red-300">
                    {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-500">✅ Aucune alerte</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graphique */}
      <div className="mt-8">
        <Card className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-purple-300/30">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-300 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Historique Clairance / Créatinine
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.historique}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip />
                <Line
                  type="monotone"
                  dataKey="clairance"
                  stroke="#8b5cf6"
                  name="Clairance (mL/min)"
                />
                <Line
                  type="monotone"
                  dataKey="creatinine"
                  stroke="#ec4899"
                  name="Créatinine (mg/dL)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Schéma interactif */}
      <div className="mt-8">
        <Card className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-purple-300/30">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-300">
              🧭 Schéma interactif des reins
            </h2>
            <div className="relative w-full max-w-3xl mx-auto">
              <img
                src={renaleImage}
                alt="Schéma des reins"
                className="w-full h-auto rounded-xl object-contain opacity-90"
              />

              {/* Rein gauche */}
              <div className="absolute top-[40%] left-[35%]">
                <Tooltip label={`Rein gauche - Clairance : ${data.clairance} mL/min`}>
                  <div className="w-6 h-6 rounded-full bg-purple-400 animate-ping" />
                </Tooltip>
              </div>

              {/* Rein droit */}
              <div className="absolute top-[40%] left-[60%]">
                <Tooltip label={`Rein droit - Créatinine : ${data.creatinine} mg/dL`}>
                  <div className="w-6 h-6 rounded-full bg-pink-400" />
                </Tooltip>
              </div>
            </div>

            {/* Légende */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-400"></span> Rein gauche
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-pink-400"></span> Rein droit
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RenalePatientCritique;
