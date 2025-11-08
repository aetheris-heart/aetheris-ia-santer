import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { Card, CardContent } from "@/components/uui/ui_card";
import { Activity, ArrowLeft, Wind } from "lucide-react";
const poumonsImage = "/assets/organs/poumons.png";

import Tooltip from "@/components/uui/Tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface PulmonaireData {
  spo2: number;
  frequence_respiratoire: number;
  alertes: string[];
  historique: { time: string; spo2: number; frequence_respiratoire: number }[];
}

const PulmonairePatientCritique: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const [data, setData] = useState<PulmonaireData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPulmo = async () => {
      try {
        const res = await api.get<PulmonaireData>(
          `/dashboard/patients-critiques/${id}/pulmonaire`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch (error) {
        console.error("Erreur récupération données pulmonaires :", error);
      }
    };

    if (token) {
      fetchPulmo();
      const interval = setInterval(fetchPulmo, 15000);
      return () => clearInterval(interval);
    }
  }, [token, id]);

  if (!data)
    return (
      <div className="text-center mt-10 text-gray-500 dark:text-gray-400">
        Chargement des données...
      </div>
    );

  return (
    <div className="p-6 min-h-screen text-gray-900 dark:text-white bg-transparent">
      {/* Bouton retour */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/patients-critiques/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au patient
        </button>
      </div>

      {/* Titre */}
      <h1 className="text-3xl font-bold flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-6">
        <Wind className="w-7 h-7" /> Fonction Pulmonaire - Patient Critique
      </h1>

      {/* Cartes principales */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-blue-600">🫁 Saturation SpO₂</h2>
            <p className="text-3xl font-bold">{data.spo2} %</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Fréquence respiratoire : {data.frequence_respiratoire} rpm
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-blue-600">⚠️ Alertes détectées</h2>
            {data.alertes.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1">
                {data.alertes.map((a, i) => (
                  <li key={i} className="text-red-500 dark:text-red-300">
                    {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-500">Aucune alerte</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graphique */}
      <div className="mt-8">
        <Card className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-indigo-600 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Historique SpO₂ / Fréquence respiratoire
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.historique}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip />
                <Line type="monotone" dataKey="spo2" stroke="#3b82f6" name="SpO₂ (%)" />
                <Line
                  type="monotone"
                  dataKey="frequence_respiratoire"
                  stroke="#06b6d4"
                  name="Respiration (rpm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Schéma interactif */}
      <div className="mt-8">
        <Card className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              🧭 Schéma interactif des poumons
            </h2>
            <div className="relative w-full max-w-3xl mx-auto">
              <img
                src={poumonsImage}
                alt="Schéma des poumons"
                className="w-full h-auto rounded-xl object-contain opacity-90"
              />

              {/* Points interactifs */}
              <div className="absolute top-[30%] left-[40%]">
                <Tooltip label={`Poumon gauche - SpO₂ : ${data.spo2}%`}>
                  <div className="w-6 h-6 rounded-full bg-blue-400 animate-ping" />
                </Tooltip>
              </div>

              <div className="absolute top-[30%] left-[60%]">
                <Tooltip label={`Poumon droit - Respiration : ${data.frequence_respiratoire} rpm`}>
                  <div className="w-6 h-6 rounded-full bg-cyan-400" />
                </Tooltip>
              </div>

              <div className="absolute top-[60%] left-[50%]">
                <Tooltip label="Trachée / Bronches">
                  <div className="w-5 h-5 rounded-full bg-indigo-500" />
                </Tooltip>
              </div>
            </div>

            {/* Légende */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-400"></span> Poumon gauche
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-400"></span> Poumon droit
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500"></span> Trachée / Bronches
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PulmonairePatientCritique;
