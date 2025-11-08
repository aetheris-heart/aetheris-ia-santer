import React, { useEffect, useState, useRef } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Car, Activity, Hammer, ShieldAlert } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ===================== Interfaces =====================
interface Ambulance {
  id: number;
  immatriculation: string;
  etat: string;
  chauffeur?: string;
  equipe?: string;
  latitude?: number;
  longitude?: number;
  vitesse?: number;
  carburant?: string;
  mission_actuelle?: string;
  niveau_priorite?: string;
  destination?: string;
  urgence_id?: number | null;
  date_mise_service?: string;
  derniere_mission?: string;
  last_update?: string;
  date_creation?: string;
}

interface AmbulanceStats {
  total: number;
  disponibles: number;
  en_mission: number;
  maintenance: number;
}

interface MissionsData {
  mois: string;
  missions: number;
}

// ===================== Composant =====================
const AmbulancesDashboard: React.FC = () => {
  const { token } = useUser();
  const [stats, setStats] = useState<AmbulanceStats | null>(null);
  const [missions, setMissions] = useState<MissionsData[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 🧠 Empêche le toast au premier chargement
  const firstLoad = useRef(true);

  // 🔄 Charger les ambulances depuis le backend
  const fetchAmbulances = async (showToast = false) => {
    try {
      setLoading(true);

      const res = await api.get("/ambulances/positions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: Ambulance[] = res.data.positions || [];

      // ⚙️ Calcul des stats
      const total = data.length;
      const disponibles = data.filter((a) => a.etat === "Disponible").length;
      const en_mission = data.filter((a) => a.etat === "En mission").length;
      const maintenance = data.filter((a) => a.etat === "Maintenance").length;

      setAmbulances(data);
      setStats({ total, disponibles, en_mission, maintenance });

      // ⚡ Missions mensuelles (simulées si pas encore branchées)
      const months = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ];

      const randomMissions = months.map((mois) => ({
        mois,
        missions: Math.floor(Math.random() * 10) + 1,
      }));

      setMissions(randomMissions);

      // ✅ Afficher un toast uniquement après le premier chargement
      if (showToast && !firstLoad.current) {
        toast.success("✅ Données ambulances mises à jour !");
      }

      firstLoad.current = false;
      setLoading(false);
    } catch (err) {
      console.error("Erreur récupération ambulances :", err);
      toast.warning("⚠️ Mise à jour interrompue (erreur réseau)");
      setLoading(false);
    }
  };

  // 🚀 Effet initial
  useEffect(() => {
    if (!token) return;
    fetchAmbulances();
    const interval = setInterval(() => fetchAmbulances(false), 20000); // 🔁 toutes les 20s
    return () => clearInterval(interval);
  }, [token]);

  if (!stats)
    return (
      <p className="text-center text-gray-500 mt-6">
        {loading ? "Chargement..." : "Aucune donnée disponible."}
      </p>
    );

  // ===================================================
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">🚑 Tableau de bord des Ambulances</h1>

      {/* 🧮 Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Car className="text-blue-500" />} label="Total" value={stats.total} />
        <StatCard
          icon={<Activity className="text-green-500" />}
          label="Disponibles"
          value={stats.disponibles}
        />
        <StatCard
          icon={<ShieldAlert className="text-red-500" />}
          label="En mission"
          value={stats.en_mission}
        />
        <StatCard
          icon={<Hammer className="text-yellow-500" />}
          label="Maintenance"
          value={stats.maintenance}
        />
      </div>

      {/* 📊 Graphique des missions */}
      <div className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow mb-10">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">
          📈 Missions par mois
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={missions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="missions" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🧾 Tableau des ambulances */}
      <div className="overflow-x-auto bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg rounded-xl shadow-lg">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Immatriculation</th>
              <th className="p-3 text-left">État</th>
              <th className="p-3 text-left">Chauffeur</th>
              <th className="p-3 text-left">Mission</th>
              <th className="p-3 text-left">Vitesse</th>
              <th className="p-3 text-left">Carburant</th>
              <th className="p-3 text-left">Latitude</th>
              <th className="p-3 text-left">Longitude</th>
              <th className="p-3 text-left">Dernière mise à jour</th>
            </tr>
          </thead>
          <tbody>
            {ambulances.map((a) => (
              <tr
                key={a.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <td className="p-3 font-semibold">{a.immatriculation}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.etat === "Disponible"
                        ? "bg-green-100 text-green-700"
                        : a.etat === "En mission"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {a.etat}
                  </span>
                </td>
                <td className="p-3">{a.chauffeur || "—"}</td>
                <td className="p-3">{a.mission_actuelle || "Aucune"}</td>
                <td className="p-3">{a.vitesse ? `${a.vitesse.toFixed(1)} km/h` : "—"}</td>
                <td className="p-3">{a.carburant || "—"}</td>
                <td className="p-3">{a.latitude?.toFixed(4) || "—"}</td>
                <td className="p-3">{a.longitude?.toFixed(4) || "—"}</td>
                <td className="p-3 text-gray-500 text-xs">
                  {a.last_update ? new Date(a.last_update).toLocaleString("fr-FR") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== Sous-composant Carte Stat =====================
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({
  icon,
  label,
  value,
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow flex flex-col items-center"
  >
    <div className="w-8 h-8 mb-2">{icon}</div>
    <p className="text-lg font-semibold">{value}</p>
    <p className="text-gray-500 text-sm">{label}</p>
  </motion.div>
);

export default AmbulancesDashboard;
