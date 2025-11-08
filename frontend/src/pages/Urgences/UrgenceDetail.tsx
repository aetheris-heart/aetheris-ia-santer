import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import {
  User,
  Activity,
  FileText,
  AlertTriangle,
  ClipboardList,
  Users,
  MapPin,
  Truck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Brain,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Urgence {
  id: number;
  nom_patient: string;
  prenom_patient?: string;
  type_urgence: string;
  description?: string;
  niveau_gravite?: string;
  statut: string;
  equipe?: string;
  lieu?: string;
  moyen_transport?: string;
  risque_vital?: string;
  latitude?: number;
  longitude?: number;
  analyse_ia?: string;
  niveau_risque_ia?: string;
  recommandation_ia?: string;
  date_signalement: string;
  date_prise_en_charge?: string;
  date_resolution?: string;
}

const UrgenceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();
  const [urgence, setUrgence] = useState<Urgence | null>(null);

  // 🔄 Charger les données
  useEffect(() => {
    const fetchUrgence = async () => {
      try {
        const res = await api.get(`/urgences/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUrgence(res.data);
      } catch {
        toast.error("❌ Urgence introuvable");
      }
    };
    fetchUrgence();
  }, [id, token]);

  // 🧭 Icône carte
  const ambulanceIcon = new L.Icon({
    iconUrl: "/assets/ambulance-red.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  // 🔘 Actions
  const updateStatut = async (newStatus: string) => {
    try {
      await api.put(
        `/urgences/${id}`,
        { statut: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`✅ Statut mis à jour : ${newStatus}`);
      setUrgence({ ...urgence!, statut: newStatus });
    } catch {
      toast.error("❌ Impossible de mettre à jour le statut");
    }
  };

  const supprimerUrgence = async () => {
    try {
      await api.delete(`/urgences/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Urgence supprimée !");
      navigate("/urgences");
    } catch {
      toast.error("❌ Échec de la suppression");
    }
  };

  if (!urgence) return <p className="text-center text-gray-500 mt-6">Chargement des données...</p>;

  return (
    <motion.div
      className="p-6 max-w-5xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Titre */}
      <h1 className="text-3xl font-bold text-red-600 mb-6 flex items-center gap-2">
        🚨 Détail Urgence #{urgence.id}
      </h1>

      {/* Carte principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informations */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
            📋 Informations générales
          </h2>

          <p>
            <strong>🧍 Patient :</strong> {urgence.nom_patient} {urgence.prenom_patient}
          </p>
          <p>
            <strong>🩺 Type :</strong> {urgence.type_urgence}
          </p>
          <p>
            <strong>📝 Description :</strong> {urgence.description || "Non défini"}
          </p>
          <p>
            <strong>⚠️ Gravité :</strong> {urgence.niveau_gravite}
          </p>
          <p>
            <strong>🧠 Risque IA :</strong> {urgence.niveau_risque_ia || "—"}
          </p>
          <p>
            <strong>💉 Recommandation IA :</strong> {urgence.recommandation_ia || "—"}
          </p>
          <p>
            <strong>💓 Risque vital :</strong> {urgence.risque_vital || "Non évalué"}
          </p>
          <p>
            <strong>📍 Lieu :</strong> {urgence.lieu || "Non précisé"}
          </p>
          <p>
            <strong>🚑 Transport :</strong> {urgence.moyen_transport || "Inconnu"}
          </p>
          <p>
            <strong>👥 Équipe :</strong> {urgence.equipe || "Non définie"}
          </p>
          <p>
            <strong>📆 Signalement :</strong>{" "}
            {new Date(urgence.date_signalement).toLocaleString("fr-FR")}
          </p>
          <p>
            <strong>⏱ Prise en charge :</strong> {urgence.date_prise_en_charge || "—"}
          </p>
          <p>
            <strong>✅ Résolution :</strong> {urgence.date_resolution || "Non résolue"}
          </p>

          {/* Analyse IA */}
          {urgence.analyse_ia && (
            <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              <h3 className="font-semibold text-purple-500 mb-2 flex items-center gap-1">
                <Brain className="w-4 h-4" /> Analyse IA Aetheris :
              </h3>
              <p>{urgence.analyse_ia}</p>
            </div>
          )}

          {/* Statut */}
          <div className="mt-6">
            <p className="text-lg font-semibold mb-2">Statut actuel :</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                urgence.statut === "Résolue"
                  ? "bg-green-100 text-green-700"
                  : urgence.statut === "En cours"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {urgence.statut}
            </span>
          </div>

          {/* Boutons d’action */}
          <div className="flex flex-wrap gap-3 mt-6">
            {urgence.statut !== "En cours" && (
              <button
                onClick={() => updateStatut("En cours")}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                🚑 Prendre en charge
              </button>
            )}
            {urgence.statut !== "Résolue" && (
              <button
                onClick={() => updateStatut("Résolue")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                ✅ Marquer comme résolue
              </button>
            )}
            <button
              onClick={() => navigate(`/urgences/modifier/${urgence.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={supprimerUrgence}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              🗑 Supprimer
            </button>
          </div>
        </div>

        {/* Carte de localisation */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 p-4">
            🗺 Localisation de l’urgence
          </h2>
          {urgence.latitude && urgence.longitude ? (
            <MapContainer
              center={[urgence.latitude, urgence.longitude]}
              zoom={14}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[urgence.latitude, urgence.longitude]} icon={ambulanceIcon}>
                <Popup>
                  <strong>{urgence.lieu || "Lieu non précisé"}</strong>
                  <br />({urgence.latitude.toFixed(4)}, {urgence.longitude.toFixed(4)})
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="p-6 text-center text-gray-500">Aucune localisation GPS disponible</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UrgenceDetail;
