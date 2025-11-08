import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyseIA {
  diagnostic: string;
  recommendation: string;
  historique: { time: string; spo2: number }[];
}

const AetherisDiagnostic: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [data, setData] = useState<AnalyseIA | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!patientId || !token) {
        setError("Identifiant du patient ou token manquant.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get<AnalyseIA>(`/aetheris/analysis/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err: any) {
        console.error(err);
        setError("❌ Impossible de récupérer l'analyse IA.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [patientId, token]);

  if (loading) return <p className="text-center text-gray-500">Chargement de l'analyse IA...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!data) return <p className="text-center text-gray-600">Aucune donnée disponible.</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">🔬 Résultats IA Aetheris</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">🆔 Patient ID : {patientId}</p>

        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-300 dark:border-white/20">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">🧠 Diagnostic</h2>
          <p className="text-lg mb-6">{data.diagnostic}</p>

          <h2 className="text-2xl font-semibold mb-4 text-green-600">💡 Recommandation IA</h2>
          <p className="text-lg mb-6">{data.recommendation}</p>

          <h2 className="text-2xl font-semibold mb-4 text-cyan-600">📈 Historique SpO₂</h2>
          <div className="h-72 bg-white dark:bg-gray-800 p-4 rounded-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.historique} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleDateString()}
                />
                <YAxis domain={[80, 100]} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-10 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl shadow"
          >
            ⬅ Retour au dossier
          </button>

          <button
            onClick={() => navigate(`/rendez-vous/creer/${patientId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl shadow"
          >
            📅 Plan d'action IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default AetherisDiagnostic;
