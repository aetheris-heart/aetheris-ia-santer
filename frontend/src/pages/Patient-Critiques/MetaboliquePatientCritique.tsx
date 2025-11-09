import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/uui/ui_card";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import MetaboliqueDiagram from "@/components/diagrams/Metaboliquediagram";

interface MetaboliqueData {
  glucose: number;
  insulin: number;
  history: { time: string; glucose: number }[];
}

const MetaboliquePatientCritique: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MetaboliqueData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/patients-critiques/${id}/metabolique`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data as MetaboliqueData);

      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des données métaboliques.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // mise à jour toutes les 15 sec
    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Fonction Métabolique - Patient Critique</h2>

      {error && <div className="text-red-500">{error}</div>}

      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">Taux de Glucose</h3>
              <p className="text-3xl font-bold">{data.glucose} mg/dL</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">Taux d'Insuline</h3>
              <p className="text-3xl font-bold">{data.insulin} µU/mL</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">Historique du Glucose</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="glucose" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">Schéma Interactif Métabolique</h3>
             <MetaboliqueDiagram glucose={data.glucose} insuline={data.insulin} />



            </CardContent>
          </Card>
        </div>
      ) : (
        <p>Chargement des données...</p>
      )}
    </div>
  );
};

export default MetaboliquePatientCritique;
