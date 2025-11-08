import React, { useState } from "react";
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
  Settings,
  Fuel,
  Gauge,
  Navigation2,
  Target,
  Activity,
  ShieldAlert,
} from "lucide-react";

const AjouterAmbulance: React.FC = () => {
  const [immatriculation, setImmatriculation] = useState("");
  const [etat, setEtat] = useState("Disponible");
  const [chauffeur, setChauffeur] = useState("");
  const [equipe, setEquipe] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [vitesse, setVitesse] = useState("");
  const [carburant, setCarburant] = useState("");
  const [mission, setMission] = useState("");
  const [priorite, setPriorite] = useState("Normale");
  const [destination, setDestination] = useState("");

  const { token } = useUser();
  const navigate = useNavigate();

  // 🔹 Envoi du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(
        "/ambulances/",
        {
          immatriculation,
          etat,
          chauffeur,
          equipe,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          vitesse: vitesse ? parseFloat(vitesse) : null,
          carburant,
          mission_actuelle: mission,
          niveau_priorite: priorite,
          destination,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Ambulance ajoutée avec succès !");
      navigate("/ambulances");
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors de l'ajout de l'ambulance");
    }
  };

  // ===================================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-2xl mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/30"
    >
      <h1 className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
        🚑 Ajouter une Ambulance
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Immatriculation */}
        <Field
          icon={<Bus className="text-blue-500" />}
          placeholder="Immatriculation"
          value={immatriculation}
          onChange={setImmatriculation}
          required
        />

        {/* Chauffeur */}
        <Field
          icon={<User className="text-purple-500" />}
          placeholder="Nom du chauffeur"
          value={chauffeur}
          onChange={setChauffeur}
        />

        {/* Équipe */}
        <Field
          icon={<Users className="text-green-500" />}
          placeholder="Nom de l’équipe"
          value={equipe}
          onChange={setEquipe}
        />

        {/* GPS */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            icon={<MapPin className="text-pink-500" />}
            placeholder="Latitude"
            value={latitude}
            onChange={setLatitude}
            type="number"
          />
          <Field
            icon={<MapPin className="text-pink-500" />}
            placeholder="Longitude"
            value={longitude}
            onChange={setLongitude}
            type="number"
          />
        </div>

        {/* Vitesse & Carburant */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            icon={<Gauge className="text-blue-400" />}
            placeholder="Vitesse (km/h)"
            value={vitesse}
            onChange={setVitesse}
            type="number"
          />
          <Field
            icon={<Fuel className="text-orange-400" />}
            placeholder="Carburant (ex: 70%)"
            value={carburant}
            onChange={setCarburant}
          />
        </div>

        {/* Mission */}
        <Field
          icon={<Navigation2 className="text-sky-500" />}
          placeholder="Mission actuelle"
          value={mission}
          onChange={setMission}
        />

        {/* Destination */}
        <Field
          icon={<Activity className="text-lime-500" />}
          placeholder="Destination"
          value={destination}
          onChange={setDestination}
        />

        {/* Priorité */}
        <div className="flex items-center gap-2">
          {/* Label invisible pour lecteurs d’écran */}
          <label htmlFor="priorite" className="sr-only">
            Priorité
          </label>

          <ShieldAlert className="w-5 h-5 text-red-500" aria-hidden="true" />

          <select
            id="priorite"
            title="Priorité"
            aria-label="Priorité"
            value={priorite}
            onChange={(e) => setPriorite(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-red-400"
          >
            <option value="Normale">🟢 Normale</option>
            <option value="Urgente">🚨 Urgente</option>
            <option value="Critique">⚠️ Critique</option>
          </select>
        </div>

        {/* État */}
        <div className="flex items-center gap-2">
          {/* Label invisible pour lecteurs d’écran */}
          <label htmlFor="etat" className="sr-only">
            État
          </label>

          <Settings className="w-5 h-5 text-yellow-500" aria-hidden="true" />

          <select
            id="etat"
            title="État"
            aria-label="État"
            value={etat}
            onChange={(e) => setEtat(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-yellow-400"
          >
            <option value="Disponible">🟢 Disponible</option>
            <option value="En mission">🚨 En mission</option>
            <option value="Maintenance">🛠️ Maintenance</option>
          </select>
        </div>

        {/* Bouton */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2 justify-center font-semibold"
        >
          🚑 Ajouter l’Ambulance
        </motion.button>
      </form>
    </motion.div>
  );
};

// ====================== Sous composant champ réutilisable ======================
const Field = ({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) => (
  <div className="flex items-center gap-2">
    {icon}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

export default AjouterAmbulance;
