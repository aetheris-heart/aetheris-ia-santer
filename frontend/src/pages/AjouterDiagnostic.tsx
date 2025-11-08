import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AjouterDiagnostic: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patient_id: "",
    maladie: "",
    description: "",
    date_diagnostic: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/diagnostics/", formData);
      alert("✅ Diagnostic enregistré avec succès !");
      navigate("/diagnostics");
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du diagnostic :", error);
      alert("Erreur lors de l'ajout du diagnostic.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Ajouter un diagnostic</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="patient_id"
          placeholder="ID du patient"
          value={formData.patient_id}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          name="maladie"
          placeholder="Maladie"
          value={formData.maladie}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          name="date_diagnostic"
          type="date"
          value={formData.date_diagnostic}
          onChange={handleChange}
          required
          className="input"
        />
        <textarea
          name="description"
          placeholder="Description du diagnostic"
          value={formData.description}
          onChange={handleChange}
          required
          className="col-span-2 input"
        />
        <div className="col-span-2 text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            ✅ Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default AjouterDiagnostic;
