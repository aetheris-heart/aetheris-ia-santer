import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";

// 🩺 Types alignés au backend
interface Ambulance {
  id: number;
  immatriculation: string;
  latitude: number;
  longitude: number;
  etat: string;
  chauffeur?: string;
  carburant?: string;
  vitesse?: number;
  mission_actuelle?: string;
}

// 🧭 Auto-centrage sur toutes les ambulances
const FitBounds = ({ ambulances }: { ambulances: Ambulance[] }) => {
  const map = useMap();
  useEffect(() => {
    if (ambulances.length > 0) {
      const bounds = ambulances.map((a) => [a.latitude, a.longitude]) as [number, number][];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [ambulances, map]);
  return null;
};

const AmbulanceMap: React.FC = () => {
  const { token } = useUser();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger les ambulances avec leurs positions GPS
  const fetchAmbulances = async () => {
    try {
      const res = await api.get("/ambulances/positions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Le backend renvoie { positions: [...] }
      setAmbulances(res.data.positions || []);
      setLoading(false);
    } catch (err) {
      console.error("❌ Erreur chargement positions ambulances :", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
    const interval = setInterval(fetchAmbulances, 10000); // 🔁 Refresh toutes les 10s
    return () => clearInterval(interval);
  }, [token]);

  // 🧮 Compteurs
  const total = ambulances.length;
  const enMission = ambulances.filter((a) => a.etat === "En mission").length;
  const disponibles = ambulances.filter((a) => a.etat === "Disponible").length;
  const maintenance = ambulances.filter((a) => a.etat === "Maintenance").length;

  // 🌍 Coordonnées par défaut (Cameroun)
  const defaultCenter: [number, number] = [3.848, 11.502];

  // 🧩 Choix de l’icône selon état (depuis /public/assets)
  const getIcon = (etat: string) => {
    let iconUrl = "/assets/ambulance-green.png";
    if (etat === "En mission") iconUrl = "/assets/ambulance-red.png";
    if (etat === "Maintenance") iconUrl = "/assets/ambulance-yellow.png";
    return new L.Icon({
      iconUrl,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -30],
      shadowUrl: "/assets/marker-shadow.png",
      shadowSize: [45, 45],
    });
  };

  // ==============================================================
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">
        🗺️ Suivi GPS en temps réel des Ambulances
      </h1>

      {/* Cartes stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <StatCard label="Total" value={total} color="text-blue-600" emoji="🚑" />
        <StatCard label="Disponibles" value={disponibles} color="text-green-600" emoji="✅" />
        <StatCard label="En mission" value={enMission} color="text-red-600" emoji="🚨" />
        <StatCard label="Maintenance" value={maintenance} color="text-yellow-600" emoji="🛠️" />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Chargement de la carte...</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <MapContainer
            center={defaultCenter}
            zoom={7}
            style={{ height: "500px", width: "100%", borderRadius: "1rem" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Ajustement des bornes */}
            <FitBounds ambulances={ambulances} />

            {/* Marqueurs */}
            {ambulances.map((a) => (
              <Marker key={a.id} position={[a.latitude, a.longitude]} icon={getIcon(a.etat)}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-blue-600">🚑 Ambulance #{a.immatriculation}</p>
                    <p>
                      Statut :{" "}
                      <span
                        className={
                          a.etat === "Disponible"
                            ? "text-green-600 font-semibold"
                            : a.etat === "En mission"
                              ? "text-red-600 font-semibold"
                              : "text-yellow-600 font-semibold"
                        }
                      >
                        {a.etat}
                      </span>
                    </p>
                    {a.chauffeur && <p>👨‍✈️ Chauffeur : {a.chauffeur}</p>}
                    {a.mission_actuelle && <p>🎯 Mission : {a.mission_actuelle}</p>}
                    {a.vitesse !== undefined && <p>💨 Vitesse : {a.vitesse.toFixed(1)} km/h</p>}
                    {a.carburant && <p>⛽ Carburant : {a.carburant}</p>}
                    <p className="text-gray-600 mt-1">
                      📍 {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* 🧭 Légende dynamique */}
          <div className="absolute bottom-3 right-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-3 text-sm space-y-1">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Légende :</p>
            <div className="flex items-center gap-2">
              <img src="/assets/ambulance-green.png" alt="dispo" className="w-5" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/assets/ambulance-red.png" alt="mission" className="w-5" />
              <span>En mission</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/assets/ambulance-yellow.png" alt="maintenance" className="w-5" />
              <span>Maintenance</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// =====================================================
// 🩺 Carte de statistique
// =====================================================
const StatCard = ({
  label,
  value,
  color,
  emoji,
}: {
  label: string;
  value: number;
  color: string;
  emoji: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow flex flex-col items-center p-3 border border-gray-200/20"
  >
    <span className={`text-lg font-semibold ${color}`}>
      {emoji} {value}
    </span>
    <p className="text-gray-500 text-xs">{label}</p>
  </motion.div>
);

export default AmbulanceMap;
