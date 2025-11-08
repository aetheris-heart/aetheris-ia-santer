import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { Card, CardContent } from "@/components/uui/ui_card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
const cerveauImage = "/assets/brain.png";

interface NeuroData {
  id: number;
  eeg: number;
  stress_level: number;
  patient_id: number;
}

const NeurologiquePatientCritique: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { token } = useUser();
  const [neuro, setNeuro] = useState<NeuroData | null>(null);
  const [history, setHistory] = useState<{ time: string; eeg: number }[]>([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get<NeuroData>(`/neurologique/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNeuro(res.data);
      setHistory((prev) => [
        ...prev.slice(-9),
        { time: new Date().toLocaleTimeString(), eeg: res.data.eeg },
      ]);
    } catch (err) {
      console.error("Erreur neurologique :", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [patientId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Fonction Neurologique - Patient #{patientId}</h2>

      {neuro ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* EEG + Stress */}
          <Card>
            <CardContent>
              <p className="text-lg font-semibold">
                🧠 EEG : <span className="text-purple-600">{neuro.eeg} μV</span>
              </p>
              <p className="text-lg font-semibold">
                😵‍💫 Stress : <span className="text-red-500">{neuro.stress_level}</span>
              </p>
            </CardContent>
          </Card>

          {/* Graphique */}
          <Card>
            <CardContent>
              <h3 className="text-md font-semibold mb-2">Historique EEG</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="eeg" stroke="#7e22ce" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Schéma cerveau */}
          <Card className="md:col-span-2">
            <CardContent className="flex flex-col items-center">
              <img src={cerveauImage} alt="Cerveau" className="w-64 h-auto mb-4" />
              <div className="text-sm space-y-1 text-center">
                <p>
                  <span className="text-purple-600 font-semibold">Zone frontale :</span> prise de
                  décision
                </p>
                <p>
                  <span className="text-blue-500 font-semibold">Zone pariétale :</span> perception
                  sensorielle
                </p>
                <p>
                  <span className="text-red-500 font-semibold">Zone limbique :</span> réponse au
                  stress
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p>Chargement des données neurologiques...</p>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
      >
        ⬅️ Retour au patient
      </button>
    </div>
  );
};

export default NeurologiquePatientCritique;
