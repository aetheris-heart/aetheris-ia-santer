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
  Gauge,
  Fuel,
  Settings,
  ShieldAlert,
  Navigation2,
  Activity,
  Save,
  X,
} from "lucide-react";

const ModifierAmbulance: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useUser();

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

  // 🔄 Charger l'ambulance existante
  useEffect(() => {
    const fetchAmbulance = async () => {
      try {
        const res = await api.get(`/ambulances/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const a = res.data;
        setImmatriculation(a.immatriculation);
        setEtat(a.etat || "Disponible");
        setChauffeur(a.chauffeur || "");
        setEquipe(a.equipe || "");
        setLatitude(a.latitude?.toString() || "");
        setLongitude(a.longitude?.toString() || "");
        setVitesse(a.vitesse?.toString() || "");
        setCarburant(a.carburant || "");
        setMission(a.mission_actuelle || "");
        setPriorite(a.niveau_priorite || "Normale");
        setDestination(a.destination || "");
      } catch {
        toast.error("❌ Ambulance introuvable");
      }
    };
    fetchAmbulance();
  }, [id, token]);

  // ✏️ Soumettre la modification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(
        `/ambulances/${id}`,
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
      toast.success("✅ Ambulance modifiée avec succès !");
      navigate("/ambulances");
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors de la modification");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-2xl mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/30"
    >
      <h1 className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
        ✏️ Modifier Ambulance
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Immatriculation */}
        <Field
          icon={<Bus className="text-blue-500" />}
          label="Immatriculation"
          placeholder="Immatriculation"
          value={immatriculation}
          onChange={setImmatriculation}
          required
        />

        {/* Chauffeur */}
        <Field
          icon={<User className="text-purple-500" />}
          label="Chauffeur"
          placeholder="Nom du chauffeur"
          value={chauffeur}
          onChange={setChauffeur}
        />

        {/* Équipe */}
        <Field
          icon={<Users className="text-green-500" />}
          label="Équipe"
          placeholder="Équipe"
          value={equipe}
          onChange={setEquipe}
        />

        {/* Coordonnées GPS */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            icon={<MapPin className="text-pink-500" />}
            label="Latitude"
            placeholder="Latitude"
            value={latitude}
            onChange={setLatitude}
            type="number"
          />
          <Field
            icon={<MapPin className="text-pink-500" />}
            label="Longitude"
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
            label="Vitesse"
            placeholder="Vitesse (km/h)"
            value={vitesse}
            onChange={setVitesse}
            type="number"
          />
          <Field
            icon={<Fuel className="text-orange-400" />}
            label="Carburant"
            placeholder="Carburant (ex: 70%)"
            value={carburant}
            onChange={setCarburant}
          />
        </div>

        {/* Mission */}
        <Field
          icon={<Navigation2 className="text-sky-500" />}
          label="Mission actuelle"
          placeholder="Mission actuelle"
          value={mission}
          onChange={setMission}
        />

        {/* Destination */}
        <Field
          icon={<Activity className="text-lime-500" />}
          label="Destination"
          placeholder="Destination"
          value={destination}
          onChange={setDestination}
        />

        {/* Priorité */}
        <div>
          <label
            htmlFor="priorite"
            className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"
          >
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Niveau de priorité
          </label>
          <select
            id="priorite"
            value={priorite}
            onChange={(e) => setPriorite(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-red-400"
            aria-label="Niveau de priorité"
          >
            <option value="Normale">🟢 Normale</option>
            <option value="Urgente">🚨 Urgente</option>
            <option value="Critique">⚠️ Critique</option>
          </select>
        </div>

        {/* État */}
        <div>
          <label
            htmlFor="etat"
            className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"
          >
            <Settings className="w-5 h-5 text-yellow-500" />
            Statut de l’ambulance
          </label>
          <select
            id="etat"
            value={etat}
            onChange={(e) => setEtat(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-yellow-400"
            aria-label="Statut de l’ambulance"
          >
            <option value="Disponible">🟢 Disponible</option>
            <option value="En mission">🚨 En mission</option>
            <option value="Maintenance">🛠️ Maintenance</option>
            <option value="Hors service">❌ Hors service</option>
          </select>
        </div>

        {/* Boutons */}
        <div className="flex gap-4 mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2 justify-center font-semibold"
          >
            <Save className="w-4 h-4" /> Enregistrer
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate("/ambulances")}
            className="flex-1 bg-gray-500 text-white py-3 rounded-lg shadow hover:bg-gray-600 transition flex items-center gap-2 justify-center font-semibold"
          >
            <X className="w-4 h-4" /> Annuler
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// 🌟 Champ réutilisable
const Field = ({
  icon,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
      {icon} {label}
    </label>
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

export default ModifierAmbulance;
