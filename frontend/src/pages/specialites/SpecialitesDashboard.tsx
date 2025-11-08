import React, { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaClinicMedical, FaChartPie, FaUserMd } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

interface Specialite {
  id: number;
  nom: string;
  description?: string;
  icone?: string;
  couleur?: string;
}

interface Stats {
  name: string;
  value: number;
}

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

const SpecialitesDashboard: React.FC = () => {
  const { token } = useUser();
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);

  const fetchData = async () => {
    try {
      const res = await api.get("/specialites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpecialites(res.data);

      // ⚡ Stats simulées pour le graphique
      setStats([
        { name: "Cardiologie", value: 120 },
        { name: "Neurologie", value: 80 },
        { name: "Pneumologie", value: 60 },
        { name: "Dermatologie", value: 50 },
      ]);
    } catch {
      toast.error("❌ Impossible de charger les données des spécialités");
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6 flex items-center gap-2">
        <FaClinicMedical /> Dashboard Spécialités
      </h1>

      {/* Cartes de stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow flex flex-col items-center"
        >
          <FaClinicMedical className="w-8 h-8 text-indigo-500 mb-2" />
          <p className="text-lg font-semibold">{specialites.length}</p>
          <p className="text-gray-500 text-sm">Spécialités</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow flex flex-col items-center"
        >
          <FaUserMd className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-lg font-semibold">32</p>
          <p className="text-gray-500 text-sm">Médecins actifs</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow flex flex-col items-center"
        >
          <FaChartPie className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-lg font-semibold">310</p>
          <p className="text-gray-500 text-sm">Patients suivis</p>
        </motion.div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camembert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold mb-4">Répartition patients par spécialité</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {stats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Histogramme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold mb-4">Consultations par spécialité</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default SpecialitesDashboard;
