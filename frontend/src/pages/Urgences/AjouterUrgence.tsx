import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import {
  AlertTriangle,
  User,
  MapPin,
  Activity,
  Stethoscope,
  Ambulance,
  HeartPulse,
  Brain,
  Shield,
} from "lucide-react";

const AjouterUrgence: React.FC = () => {
  const [formData, setFormData] = useState({
    nom_patient: "",
    prenom_patient: "",
    type_urgence: "",
    description: "",
    niveau_gravite: "Modérée",
    statut: "En attente",
    equipe: "",
    lieu: "",
    moyen_transport: "Ambulance",
    age: "",
    sexe: "",
    risque_vital: "",
    latitude: "",
    longitude: "",
    patient_id: "",
  });

  const { token } = useUser();
  const navigate = useNavigate();

  // 📝 Gestion des champs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🧠 Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        patient_id: formData.patient_id ? Number(formData.patient_id) : null,
      };

      await api.post("/urgences/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Urgence ajoutée avec succès !");
      navigate("/urgences");
    } catch (err: any) {
      console.error("Erreur ajout urgence :", err);
      toast.error(err.response?.data?.detail || "❌ Échec de la création de l’urgence");
    }
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold text-red-600 mb-6 flex items-center gap-2">
        🚨 Nouvelle Urgence Médicale
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-5"
      >
        {/* 🔹 Infos Patient */}
        <div>
          <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <User className="text-blue-500 w-5 h-5" /> Informations du patient
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="nom_patient"
              placeholder="Nom"
              value={formData.nom_patient}
              onChange={handleChange}
              className="input-style"
              required
            />
            <input
              name="prenom_patient"
              placeholder="Prénom"
              value={formData.prenom_patient}
              onChange={handleChange}
              className="input-style"
            />
            <input
              name="age"
              type="number"
              placeholder="Âge"
              value={formData.age}
              onChange={handleChange}
              className="input-style"
            />
            <select
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              className="input-style"
            >
              <option value="">Sexe</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>
        </div>

        {/* 🔹 Détails Urgence */}
        <div>
          <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="text-red-500 w-5 h-5" /> Détails de l’urgence
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="type_urgence"
              placeholder="Type d'urgence (Accident, Cardiaque...)"
              value={formData.type_urgence}
              onChange={handleChange}
              className="input-style"
              required
            />
            <select
              name="niveau_gravite"
              value={formData.niveau_gravite}
              onChange={handleChange}
              className="input-style"
            >
              <option>Faible</option>
              <option>Modérée</option>
              <option>Critique</option>
            </select>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="input-style"
            >
              <option>En attente</option>
              <option>En cours</option>
              <option>Résolue</option>
            </select>
            <input
              name="equipe"
              placeholder="Équipe d’intervention"
              value={formData.equipe}
              onChange={handleChange}
              className="input-style"
            />
          </div>
          <textarea
            name="description"
            placeholder="Description de l’urgence"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 mt-3"
            rows={3}
          />
        </div>

        {/* 🔹 Localisation & Transport */}
        <div>
          <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <MapPin className="text-green-500 w-5 h-5" /> Localisation & transport
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="lieu"
              placeholder="Lieu de l’incident"
              value={formData.lieu}
              onChange={handleChange}
              className="input-style"
            />
            <select
              name="moyen_transport"
              value={formData.moyen_transport}
              onChange={handleChange}
              className="input-style"
            >
              <option>Ambulance</option>
              <option>Hélicoptère</option>
              <option>Autre</option>
            </select>
            <input
              name="latitude"
              placeholder="Latitude GPS"
              value={formData.latitude}
              onChange={handleChange}
              className="input-style"
            />
            <input
              name="longitude"
              placeholder="Longitude GPS"
              value={formData.longitude}
              onChange={handleChange}
              className="input-style"
            />
          </div>
        </div>

        {/* 🔹 Analyse IA */}
        <div>
          <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Brain className="text-purple-500 w-5 h-5" /> Analyse IA (Aetheris)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <select
              name="risque_vital"
              value={formData.risque_vital}
              onChange={handleChange}
              className="input-style"
            >
              <option value="">Risque vital</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
              <option value="À évaluer">À évaluer</option>
            </select>
            <input
              name="patient_id"
              type="number"
              placeholder="ID Patient (optionnel)"
              value={formData.patient_id}
              onChange={handleChange}
              className="input-style"
            />
          </div>
        </div>

        {/* 🔘 Bouton */}
        <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg font-semibold transition">
          🚑 Enregistrer l’urgence
        </button>
      </form>
    </motion.div>
  );
};

export default AjouterUrgence;

// ===================================================
// 💅 Petites classes globales utilitaires
// (tu peux les mettre dans ton fichier CSS global Tailwind)
// ===================================================
// .input-style {
//   @apply w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white;
// }
