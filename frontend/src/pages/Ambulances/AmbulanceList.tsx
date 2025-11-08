import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import {
  Bus,
  User,
  Users,
  MapPin,
  Link2,
  ShieldAlert,
  Gauge,
  Fuel,
  Navigation2,
  Activity,
  Clock,
} from "lucide-react";

// ===================== Interface =====================
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
}

// ===================== Composant principal =====================
const AmbulancesList: React.FC = () => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const { token } = useUser();
  const navigate = useNavigate();

  // 🔄 Récupérer les ambulances en temps réel (polling toutes les 10s)
  const fetchAmbulances = async () => {
    try {
      const res = await api.get<Ambulance[]>("/ambulances", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAmbulances(res.data);
    } catch (err) {
      toast.error("❌ Impossible de charger les ambulances");
    }
  };

  useEffect(() => {
    fetchAmbulances();
    const interval = setInterval(fetchAmbulances, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // 🎨 Badge coloré selon l'état
  const renderEtat = (etat: string) => {
    switch (etat) {
      case "Disponible":
        return (
          <span className="px-3 py-1 text-sm bg-green-200 text-green-700 rounded-full">
            🟢 Disponible
          </span>
        );
      case "En mission":
        return (
          <span className="px-3 py-1 text-sm bg-red-200 text-red-700 rounded-full animate-pulse">
            🚨 En mission
          </span>
        );
      case "Maintenance":
        return (
          <span className="px-3 py-1 text-sm bg-yellow-200 text-yellow-700 rounded-full">
            🛠️ Maintenance
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full">
            ❔ Inconnu
          </span>
        );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
        🚑 Gestion des Ambulances
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ambulances.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            className="p-6 rounded-xl shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/30 flex flex-col gap-3"
          >
            {/* 🚘 En-tête */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
                <Bus className="w-5 h-5 text-blue-500" />
                {a.immatriculation}
              </div>
              {renderEtat(a.etat)}
            </div>

            {/* 🧑‍✈️ Détails chauffeur / équipe */}
            <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 text-purple-500" /> Chauffeur :{" "}
              <span className="font-medium">{a.chauffeur || "Non défini"}</span>
            </p>

            <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Users className="w-4 h-4 text-green-500" /> Équipe :{" "}
              <span className="font-medium">{a.equipe || "Non définie"}</span>
            </p>

            {/* 📍 Coordonnées GPS */}
            <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-pink-500" /> GPS :{" "}
              {a.latitude && a.longitude
                ? `${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}`
                : "Inconnue"}
            </p>

            {/* 🧭 Détails techniques */}
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-400" />{" "}
                {a.vitesse ? `${a.vitesse} km/h` : "0 km/h"}
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-orange-400" /> {a.carburant || "—"}
              </div>
            </div>

            {/* ⚡ Mission / Destination */}
            <div className="mt-2">
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Navigation2 className="w-4 h-4 text-sky-500" /> Mission :{" "}
                <span className="font-medium">{a.mission_actuelle || "Aucune"}</span>
              </p>
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Activity className="w-4 h-4 text-lime-500" /> Destination :{" "}
                <span className="font-medium">{a.destination || "Non précisée"}</span>
              </p>
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Priorité :{" "}
                <span className="font-medium">{a.niveau_priorite || "Normale"}</span>
              </p>
            </div>

            {/* 🕒 Dernière mise à jour */}
            <p className="flex items-center gap-2 text-gray-500 text-xs mt-2">
              <Clock className="w-3 h-3" />{" "}
              {a.last_update
                ? `Mise à jour : ${new Date(a.last_update).toLocaleString("fr-FR")}`
                : "Pas de mise à jour"}
            </p>

            {/* 🔗 Bouton */}
            <button
              onClick={() => navigate(`/ambulances/${a.id}`)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center transition"
            >
              <Link2 className="w-4 h-4" /> Voir détails
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AmbulancesList;
