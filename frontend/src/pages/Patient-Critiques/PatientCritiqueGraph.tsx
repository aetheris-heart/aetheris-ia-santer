import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  history: { time: string; spo2: number; rythme_cardiaque: number; temperature: number }[];
}

const PatientCritiqueGraph: React.FC<Props> = ({ history }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        📊 Évolution des paramètres vitaux
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="time" tick={{ fill: "white" }} />
          <YAxis tick={{ fill: "white" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="spo2" stroke="#00bcd4" name="SpO₂" />
          <Line
            type="monotone"
            dataKey="rythme_cardiaque"
            stroke="#ef4444"
            name="Rythme cardiaque"
          />
          <Line type="monotone" dataKey="temperature" stroke="#f59e0b" name="Température" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PatientCritiqueGraph;
