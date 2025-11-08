import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AjouterPatient: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    age: "",
    sexe: "",
    telephone: "",
    adresse: "",
    email: "",
    groupe_sanguin: "",
    allergies: "",
    antecedents: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/patients/", formData);
      navigate("/patients");
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient :", error);
      alert("Échec de l'enregistrement. Veuillez réessayer.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        Formulaire d'enregistrement d'un patient
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          name="prenom"
          placeholder="Prénom"
          value={formData.prenom}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          name="age"
          type="number"
          placeholder="Âge"
          value={formData.age}
          onChange={handleChange}
          className="input"
          required
        />
        <select
          name="sexe"
          value={formData.sexe}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">Sexe</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>
        <input
          name="telephone"
          placeholder="Téléphone"
          value={formData.telephone}
          onChange={handleChange}
          className="input"
        />
        <input
          name="adresse"
          placeholder="Adresse"
          value={formData.adresse}
          onChange={handleChange}
          className="input"
        />
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="input"
        />
        <input
          name="groupe_sanguin"
          placeholder="Groupe sanguin"
          value={formData.groupe_sanguin}
          onChange={handleChange}
          className="input"
        />
        <input
          name="allergies"
          placeholder="Allergies"
          value={formData.allergies}
          onChange={handleChange}
          className="input col-span-2"
        />
        <input
          name="antecedents"
          placeholder="Antécédents médicaux"
          value={formData.antecedents}
          onChange={handleChange}
          className="input col-span-2"
        />
        <div className="col-span-2 text-right">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            ✅ Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default AjouterPatient;
