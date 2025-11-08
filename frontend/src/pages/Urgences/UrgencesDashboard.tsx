import React, { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  User,
  MapPin,
  Stethoscope,
  Clock,
  HeartPulse,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Urgence {
  id: number;
  nom_patient: string;
  type_urgence: string;
  niveau_gravite: string;
  statut: string;
  lieu?: string;
  latitude?: number;
  longitude?: number;
}

interface Statistiques {
  total: number;
  enCours: number;
  resolues: number;
  critiques: number;
  medecinsConnectes: number;
}

const UrgencesDashboard: React.FC = () => {
  const { token } = useUser();
  const [stats, setStats] = useState<Statistiques | null>(null);
  const [urgences, setUrgences] = useState<Urgence[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger les données
  const fetchData = async () => {
    try {
      const res = await api.get("/urgences", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data;

      setUrgences(all);
      setStats({
        total: all.length,
        enCours: all.filter((u: Urgence) => u.statut === "En cours").length,
        resolues: all.filter((u: Urgence) => u.statut === "Résolue").length,
        critiques: all.filter((u: Urgence) => u.niveau_gravite === "Critique").length,
        medecinsConnectes: 4, // 🔹 à remplacer par vraie route /users/connected plus tard
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // toutes les 15 sec
    return () => clearInterval(interval);
  }, [token]);

  // 🧭 Icône Leaflet
  const getIcon = (gravite: string) =>
    new L.Icon({
      iconUrl:
        gravite === "Critique"
          ? "/assets/ambulance-red.png"
          : gravite === "Modérée"
            ? "/assets/ambulance-yellow.png"
            : "/assets/ambulance-green.png",
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });

  if (loading) return <p className="text-center text-gray-500 mt-6">Chargement...</p>;

  // 🎨 Couleurs graphiques
  const COLORS = ["#ef4444", "#facc15", "#22c55e"];

  const graviteData = [
    { name: "Critiques", value: stats?.critiques || 0 },
    {
      name: "Modérées",
      value: urgences.filter((u) => u.niveau_gravite === "Modérée").length || 0,
    },
    { name: "Faibles", value: urgences.filter((u) => u.niveau_gravite === "Faible").length || 0 },
  ];

  const evolutionData = [
    { mois: "Jan", urgences: 4 },
    { mois: "Fév", urgences: 6 },
    { mois: "Mar", urgences: 3 },
    { mois: "Avr", urgences: 8 },
    { mois: "Mai", urgences: 5 },
    { mois: "Juin", urgences: 7 },
  ];

  return (
    <motion.div
      className="p-8 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <h1 className="text-3xl font-bold text-red-600 mb-4">🚑 Tableau de bord — Urgences IA</h1>

      {/* 🔹 Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Activity />}
          label="Total"
          value={stats?.total || 0}
          color="text-blue-600"
        />
        <StatCard
          icon={<AlertTriangle />}
          label="Critiques"
          value={stats?.critiques || 0}
          color="text-red-600"
        />
        <StatCard
          icon={<HeartPulse />}
          label="En cours"
          value={stats?.enCours || 0}
          color="text-yellow-600"
        />
        <StatCard
          icon={<CheckCircle2 />}
          label="Résolues"
          value={stats?.resolues || 0}
          color="text-green-600"
        />
      </div>

      {/* 📊 Graphiques */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-md">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-500 w-5 h-5" /> Répartition par gravité
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={graviteData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                fill="#8884d8"
                label
              >
                {graviteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-md">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="text-green-500 w-5 h-5" /> Évolution mensuelle
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="urgences" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🗺 Carte temps réel */}
      <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
          🗺 Localisation des urgences
        </h2>
        <MapContainer
          center={[3.85, 11.5]}
          zoom={6}
          style={{ height: "400px", width: "100%", borderRadius: "1rem" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {urgences
            .filter((u) => u.latitude && u.longitude)
            .map((u) => (
              <Marker
                key={u.id}
                position={[u.latitude!, u.longitude!]}
                icon={getIcon(u.niveau_gravite)}
              >
                <Popup>
                  <strong>{u.nom_patient}</strong>
                  <br />
                  {u.type_urgence} — {u.niveau_gravite}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* 🧾 Tableau récapitulatif */}
      <div className="overflow-x-auto bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg">
        <table className="min-w-full border text-sm">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Gravité</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Lieu</th>
            </tr>
          </thead>
          <tbody>
            {urgences.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="p-3">{u.nom_patient}</td>
                <td className="p-3">{u.type_urgence}</td>
                <td
                  className={`p-3 ${
                    u.niveau_gravite === "Critique"
                      ? "text-red-600 font-semibold"
                      : u.niveau_gravite === "Modérée"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {u.niveau_gravite}
                </td>
                <td>{u.statut}</td>
                <td>{u.lieu || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default UrgencesDashboard;

// 🔹 Carte Statistique Composant
const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow flex flex-col items-center p-4"
  >
    <div className={`text-2xl mb-2 ${color}`}>{icon}</div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </motion.div>
);
