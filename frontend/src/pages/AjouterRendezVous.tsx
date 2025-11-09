import React, { useState } from "react";
import api from "@/components/lib/axios";
import { useNavigate } from "react-router-dom";

const AjouterRendezVous: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    age: "",
    motif: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non trouvé");
      }

      await api.post("/rendezvous", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✔ Rendez-vous enregistré avec succès !");
      navigate("/rendezvous");
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous :", error);
      alert("Erreur lors de la création du rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(formData).every((val) => val.trim() !== "");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600 dark:text-blue-400">
        📅 Créer un Nouveau Rendez-vous
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full p-3 rounded-md border dark:bg-gray-700 dark:text-white"
              placeholder="Nom du patient"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full p-3 rounded-md border dark:bg-gray-700 dark:text-white"
              placeholder="Prénom du patient"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-md border dark:bg-gray-700 dark:text-white"
              placeholder="Email du patient"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full p-3 rounded-md border dark:bg-gray-700 dark:text-white"
              placeholder="Téléphone du patient"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className="w-full p-3 rounded-md border dark:bg-gray-700 dark:text-white"
              placeholder="Adresse de domicile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Âge</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-3 rounded-md border dark:bg-gray-700 dark:text-white"
              placeholder="Âge du patient"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="motif" className="block text-sm font-medium text-gray-700 mb-1">
  Motif du rendez-vous
</label>
<select
  id="motif"
  name="motif"
  value={formData.motif}
  onChange={handleChange}
  className="input"
  required
  aria-label="Motif du rendez-vous"
>
  <option value="">-- Sélectionnez un motif --</option>
  <option value="consultation">Consultation</option>
  <option value="suivi">Suivi médical</option>
  <option value="urgence">Urgence</option>
  <option value="bilan">Bilan de santé</option>
</select>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition"
        >
          {loading ? "Création en cours..." : "Créer le Rendez-vous"}
        </button>
      </form>
    </div>
  );
};

export default AjouterRendezVous;
