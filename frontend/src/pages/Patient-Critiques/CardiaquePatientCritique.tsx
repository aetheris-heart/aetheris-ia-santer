import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui/ui_card";
import { HeartPulse, ArrowLeft, Activity } from "lucide-react";
const heartImage = "/assets/coeur.png";

import Tooltip from "@/components/uui/Tooltip";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
} from "recharts";

interface CardiaqueData {
  frequence: number;
  rythme: string;
  alertes: string[];
  historique: { time: string; frequence: number }[];
}

const CardiaquePatientCritique: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const [data, setData] = useState<CardiaqueData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCardiaque = async () => {
      try {
        const res = await axios.get<CardiaqueData>(
          `http://localhost:8000/dashboard/patients-critiques/${id}/cardiaque`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch (error) {
        console.error("Erreur récupération données cardiaques :", error);
      }
    };

    if (token) {
      fetchCardiaque();
      const interval = setInterval(fetchCardiaque, 15000);
      return () => clearInterval(interval);
    }
  }, [token, id]);

  if (!data)
    return <div className="text-center mt-10 text-gray-400">Chargement des données...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-gray-900 dark:to-red-900 min-h-screen text-gray-900 dark:text-white">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/patients-critiques/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au patient
        </button>
      </div>

      <h1 className="text-3xl font-bold flex items-center gap-2 text-red-800 dark:text-red-300 mb-6">
        <HeartPulse className="w-7 h-7" /> Fonction Cardiaque - Patient Critique
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-red-600">❤️ Fréquence cardiaque</h2>
            <p className="text-3xl font-bold">{data.frequence} bpm</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Rythme : {data.rythme}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-red-600">⚠️ Alertes détectées</h2>
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
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-indigo-600 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Historique de la fréquence cardiaque
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.historique}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip />
                <Line type="monotone" dataKey="frequence" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Schéma interactif */}
      <div className="mt-8">
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              🧠 Schéma interactif du cœur
            </h2>
            <div className="relative w-full max-w-3xl mx-auto">
              <img
                src={heartImage}
                alt="Schéma du cœur"
                className="w-full h-auto rounded-xl object-contain opacity-90"
              />

              {/* Points interactifs */}
              <div className="absolute top-[18%] left-[25%]">
                <Tooltip label={`Oreillette gauche - ${data.frequence} bpm`}>
                  <div className="w-6 h-6 rounded-full bg-red-500 animate-ping" />
                </Tooltip>
              </div>

              <div className="absolute top-[18%] left-[65%]">
                <Tooltip label="Oreillette droite">
                  <div className="w-6 h-6 rounded-full bg-blue-400" />
                </Tooltip>
              </div>

              <div className="absolute top-[55%] left-[25%]">
                <Tooltip label={`Ventricule gauche - Rythme : ${data.rythme}`}>
                  <div className="w-6 h-6 rounded bg-green-600" />
                </Tooltip>
              </div>

              <div className="absolute top-[55%] left-[65%]">
                <Tooltip label="Ventricule droit">
                  <div className="w-6 h-6 rounded bg-yellow-400" />
                </Tooltip>
              </div>

              <div className="absolute top-[12%] left-[35%]">
                <Tooltip label="Nœud sinusal">
                  <div className="w-4 h-4 rounded-full bg-violet-500" />
                </Tooltip>
              </div>

              <div className="absolute top-[40%] left-[50%]">
                <Tooltip label="Nœud AV">
                  <div className="w-4 h-4 rounded-full bg-yellow-600" />
                </Tooltip>
              </div>
            </div>

            {/* Légende */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-400"></span> Oreillette gauche
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-400"></span> Oreillette droite
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-green-600"></span> Ventricule gauche
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-yellow-400"></span> Ventricule droit
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-violet-500"></span> Nœud sinusal
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-yellow-600"></span> Nœud AV
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CardiaquePatientCritique;
