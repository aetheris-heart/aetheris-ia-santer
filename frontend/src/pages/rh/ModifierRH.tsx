import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { RH } from "@/types";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ModifierRH: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    poste: "",
    service: "",
    type_contrat: "CDI",
    salaire: "",
    statut: "actif",
  });

  const [loading, setLoading] = useState(true);

  // Charger les données RH existantes
  useEffect(() => {
    const fetchRH = async () => {
      try {
        const response = await api.get(`/rh/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rhData = response.data as RH;
        setFormData({
          nom: rhData.nom || "",
          prenom: rhData.prenom || "",
          email: rhData.email || "",
          telephone: rhData.telephone || "",
          poste: rhData.poste || "",
          service: rhData.service || "",
          type_contrat: rhData.type_contrat || "CDI",
          salaire: rhData.salaire ? String(rhData.salaire) : "",
          statut: rhData.statut || "actif",
        });
      } catch (error) {
        console.error("Erreur chargement RH:", error);
        toast.error("❌ Impossible de charger cet employé RH.");
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchRH();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/rh/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Employé RH mis à jour avec succès !");
      navigate(`/rh/${id}`);
    } catch (error) {
      console.error("Erreur mise à jour RH:", error);
      toast.error("❌ Erreur lors de la mise à jour.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-yellow-500 text-xl">
        🔄 Chargement des données RH...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-gray-900/70 backdrop-blur-md border border-yellow-600 shadow-2xl rounded-2xl p-8"
      >
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          ✏️ Modifier un Employé RH
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="nom" className="mb-1 text-sm text-gray-300">
                Nom
              </label>
              <input
                id="nom"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="prenom" className="mb-1 text-sm text-gray-300">
                Prénom
              </label>
              <input
                id="prenom"
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 text-sm text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="telephone" className="mb-1 text-sm text-gray-300">
                Téléphone
              </label>
              <input
                id="telephone"
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          {/* Poste & Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="poste" className="mb-1 text-sm text-gray-300">
                Poste
              </label>
              <input
                id="poste"
                type="text"
                name="poste"
                value={formData.poste}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="service" className="mb-1 text-sm text-gray-300">
                Service
              </label>
              <input
                id="service"
                type="text"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          {/* Contrat & Salaire */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label htmlFor="type_contrat" className="mb-1 text-sm text-gray-300">
                Type de contrat
              </label>
              <select
                id="type_contrat"
                name="type_contrat"
                value={formData.type_contrat}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Interim">Intérim</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="salaire" className="mb-1 text-sm text-gray-300">
                Salaire (€)
              </label>
              <input
                id="salaire"
                type="number"
                name="salaire"
                value={formData.salaire}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="statut" className="mb-1 text-sm text-gray-300">
                Statut
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              >
                <option value="actif">Actif</option>
                <option value="congé">En congé</option>
                <option value="démissionné">Démissionné</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition"
          >
            ✅ Enregistrer les modifications
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ModifierRH;
