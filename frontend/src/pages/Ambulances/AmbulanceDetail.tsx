import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import {
  Bus,
  User,
  Users,
  MapPin,
  ShieldAlert,
  Calendar,
  Clock,
  ArrowLeft,
  Pencil,
  Trash2,
  Gauge,
  Fuel,
  Navigation2,
  Activity,
  Satellite,
} from "lucide-react";

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
  gps_status?: string;
  etat_ia?: string;
}

const AmbulanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [realtime, setRealtime] = useState<Ambulance | null>(null);
  const { token } = useUser();
  const navigate = useNavigate();

  // 🔹 Charger les infos principales
  const fetchAmbulance = async () => {
    try {
      const res = await api.get(`/ambulances/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAmbulance(res.data);
    } catch {
      toast.error("❌ Ambulance introuvable");
    }
  };

  // 🔹 Charger le suivi temps réel
  const fetchRealtimeData = async () => {
    try {
      const res = await api.get("/ambulances/positions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const match = res.data.positions.find((a: any) => a.id === Number(id));
      if (match) setRealtime(match);
    } catch {
      console.warn("⚠️ Erreur lors de la récupération du suivi GPS");
    }
  };

  useEffect(() => {
    fetchAmbulance();
    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 10000); // ⏱️ refresh toutes les 10s
    return () => clearInterval(interval);
  }, [id, token]);

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

  if (!ambulance) return <p className="text-center text-gray-500 mt-6">Chargement...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-3xl mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/30"
    >
      <h1 className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
        🚑 Ambulance #{ambulance.id} — {ambulance.immatriculation}
      </h1>

      <div className="space-y-3 text-gray-800 dark:text-gray-200">
        <div>{renderEtat(ambulance.etat)}</div>

        <p className="flex items-center gap-2">
          <User className="w-5 h-5 text-purple-500" />
          <strong>Chauffeur :</strong> {ambulance.chauffeur || "Non défini"}
        </p>

        <p className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          <strong>Équipe :</strong> {ambulance.equipe || "Non définie"}
        </p>

        <p className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-pink-500" />
          <strong>Coordonnées GPS :</strong>{" "}
          {ambulance.latitude && ambulance.longitude
            ? `${ambulance.latitude.toFixed(4)}, ${ambulance.longitude.toFixed(4)}`
            : "Non disponibles"}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <p className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-400" />
            <strong>Vitesse :</strong>{" "}
            {realtime?.vitesse ? `${realtime.vitesse.toFixed(1)} km/h` : "0 km/h"}
          </p>
          <p className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-orange-400" />
            <strong>Carburant :</strong> {realtime?.carburant || ambulance.carburant || "Inconnu"}
          </p>
        </div>

        <p className="flex items-center gap-2">
          <Navigation2 className="w-5 h-5 text-sky-500" />
          <strong>Mission actuelle :</strong>{" "}
          {ambulance.mission_actuelle || "Aucune mission en cours"}
        </p>

        <p className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-lime-500" />
          <strong>Destination :</strong> {ambulance.destination || "Non précisée"}
        </p>

        <p className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <strong>Priorité :</strong> {ambulance.niveau_priorite || "Normale"}
        </p>

        {/* 🚨 Données IA temps réel */}
        {realtime && (
          <p className="flex items-center gap-2">
            <Satellite className="w-5 h-5 text-blue-500" />
            <strong>Signal GPS :</strong> {realtime.gps_status} — {realtime.etat_ia}
          </p>
        )}

        {ambulance.urgence_id ? (
          <p className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="w-5 h-5" />
            <strong>Urgence liée :</strong> #{ambulance.urgence_id}
          </p>
        ) : (
          <p className="text-gray-500 text-sm">Aucune urgence en cours</p>
        )}

        <p className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <strong>Mise en service :</strong>{" "}
          {ambulance.date_mise_service
            ? new Date(ambulance.date_mise_service).toLocaleDateString("fr-FR")
            : "Inconnue"}
        </p>

        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          Dernière mise à jour :{" "}
          {ambulance.last_update
            ? new Date(ambulance.last_update).toLocaleString("fr-FR")
            : "Jamais mise à jour"}
        </p>
      </div>

      {/* 🧭 Boutons */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={() => navigate("/ambulances")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <button
          onClick={() => navigate(`/ambulances/modifier/${ambulance.id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Pencil className="w-4 h-4" /> Modifier
        </button>

        <button
          onClick={async () => {
            try {
              await api.delete(`/ambulances/${ambulance.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              toast.success("✅ Ambulance supprimée !");
              navigate("/ambulances");
            } catch {
              toast.error("❌ Suppression échouée");
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4" /> Supprimer
        </button>
      </div>
    </motion.div>
  );
};

export default AmbulanceDetail;
