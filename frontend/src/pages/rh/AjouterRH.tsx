import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { RH } from "@/types";

const AjouterRH: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useUser();

  const [formData, setFormData] = useState({
    matricule: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    sexe: "",
    date_naissance: "",
    poste: "",
    role: "Employé",
    service: "",
    type_contrat: "CDI",
    niveau_etude: "",
    experience: 0,
    salaire: 0,
    prime: 0,
    devise: "EUR",
    iban: "",
    assurance_sante: "",
    photo_url: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        ["salaire", "prime", "experience"].includes(name) && value !== "" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post<RH>("/rh/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Employé RH ajouté avec succès !");
      navigate(`/rh/${res.data.id}`);
    } catch (error: any) {
      console.error("Erreur ajout RH :", error);
      toast.error(
        error?.response?.data?.detail || "❌ Erreur lors de l'ajout de la ressource humaine."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="w-full max-w-3xl bg-gray-900/70 backdrop-blur-md border border-yellow-600 shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          ➕ Ajouter un Employé RH
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="matricule" className="mb-1 text-sm text-gray-300">
                Matricule
              </label>
              <input
                id="matricule"
                name="matricule"
                title="Numéro de matricule de l'employé"
                type="text"
                value={formData.matricule}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="nom" className="mb-1 text-sm text-gray-300">
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                title="Nom de famille de l'employé"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="prenom" className="mb-1 text-sm text-gray-300">
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                title="Prénom de l'employé"
                type="text"
                value={formData.prenom}
                onChange={handleChange}
                required
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
                name="email"
                title="Adresse email professionnelle"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="telephone" className="mb-1 text-sm text-gray-300">
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                title="Numéro de téléphone professionnel"
                type="tel"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          {/* Sexe et Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="sexe" className="mb-1 text-sm text-gray-300">
                Sexe
              </label>
              <select
                id="sexe"
                name="sexe"
                title="Sexe de l'employé"
                value={formData.sexe}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              >
                <option value="">Sélectionner</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="date_naissance" className="mb-1 text-sm text-gray-300">
                Date de naissance
              </label>
              <input
                id="date_naissance"
                name="date_naissance"
                title="Date de naissance de l'employé"
                type="date"
                value={formData.date_naissance}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="flex flex-col">
            <label htmlFor="adresse" className="mb-1 text-sm text-gray-300">
              Adresse
            </label>
            <input
              id="adresse"
              name="adresse"
              title="Adresse complète de l'employé"
              type="text"
              value={formData.adresse}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
            />
          </div>

          {/* Poste & Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="poste" className="mb-1 text-sm text-gray-300">
                Poste
              </label>
              <input
                id="poste"
                name="poste"
                title="Poste occupé par l'employé"
                type="text"
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
                name="service"
                title="Service d'affectation de l'employé"
                type="text"
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
                title="Type de contrat de travail"
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
                name="salaire"
                title="Salaire mensuel brut"
                type="number"
                step="0.01"
                value={formData.salaire || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="prime" className="mb-1 text-sm text-gray-300">
                Prime (€)
              </label>
              <input
                id="prime"
                name="prime"
                title="Prime mensuelle éventuelle"
                type="number"
                step="0.01"
                value={formData.prime || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          {/* Autres infos */}
          <div className="flex flex-col">
            <label htmlFor="photo_url" className="mb-1 text-sm text-gray-300">
              URL Photo (optionnel)
            </label>
            <input
              id="photo_url"
              name="photo_url"
              title="Lien de la photo de l'employé"
              type="text"
              value={formData.photo_url || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {loading ? "⏳ Enregistrement..." : "✅ Ajouter Employé RH"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AjouterRH;
