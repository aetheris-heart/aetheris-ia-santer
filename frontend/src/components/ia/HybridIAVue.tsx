import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { Card, CardContent } from "@/components/uui/ui_card";
import { toast } from "react-toastify";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface TimePoint {
  time: string;
  heart_rate: number;
  glucose: number;
  acidite: number;
}

interface HybridIAResponse {
  heart_rate_avg: number;
  glucose_avg: number;
  acidite_avg: number;
  alert: string;
  history: TimePoint[];
}

const HybridIAVue: React.FC = () => {
  const { token } = useUser();
  const [data, setData] = useState<HybridIAResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get<HybridIAResponse>("/dashboard/stats/cross-analysis", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (error) {
      toast.error("Erreur de chargement des données IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-slate-100 to-white dark:from-gray-900 dark:to-black text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">
        🧬 Synthèse IA : Vue Hybride Globale & Individuelle
      </h1>

      {loading ? (
        <p className="text-center">Chargement en cours...</p>
      ) : data ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">📊 Moyennes Globales</h2>
              <ul className="space-y-2">
                <li>
                  ❤ Rythme cardiaque moyen : <strong>{data.heart_rate_avg.toFixed(1)} bpm</strong>
                </li>
                <li>
                  🧪 Glycémie moyenne : <strong>{data.glucose_avg.toFixed(1)} mg/dL</strong>
                </li>
                <li>
                  🔥 Acidité gastrique moyenne : <strong>{data.acidite_avg.toFixed(1)} pH</strong>
                </li>
              </ul>
              <p className="mt-4 text-red-600 dark:text-red-400">⚠️ {data.alert}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">📈 Évolution en Temps Réel</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.history} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="heart_rate" stroke="#EF4444" name="Rythme" />
                  <Line type="monotone" dataKey="glucose" stroke="#3B82F6" name="Glucose" />
                  <Line type="monotone" dataKey="acidite" stroke="#10B981" name="Acidité" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-center text-red-600">Aucune donnée disponible.</p>
      )}
    </div>
  );
};

export default HybridIAVue;
