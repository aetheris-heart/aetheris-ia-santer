import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AjouterMedecin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser(); // 👑 On vérifie que seul un admin peut ajouter
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "medecin",
    specialite: "",
    photo_url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/admin/create", formData);
      toast.success("✅ Médecin ajouté avec succès !");
      navigate("/users"); // 👑 redirection vers la liste des médecins/utilisateurs
    } catch (error: any) {
      console.error("Erreur ajout médecin :", error);
      toast.error("❌ Erreur lors de l'ajout du médecin.");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-red-600 font-semibold">
        🚫 Accès refusé : seuls les administrateurs peuvent ajouter des médecins.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Ajouter un Médecin</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
            className="w-1/2 border border-gray-300 px-4 py-2 rounded"
          />
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            required
            className="w-1/2 border border-gray-300 px-4 py-2 rounded"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />

        <input
          type="text"
          name="specialite"
          placeholder="Spécialité médicale"
          value={formData.specialite}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />

        <input
          type="text"
          name="photo_url"
          placeholder="URL photo (optionnelle)"
          value={formData.photo_url}
          onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          {loading ? "⏳ Enregistrement..." : "✅ Ajouter Médecin"}
        </button>
      </form>
    </div>
  );
};

export default AjouterMedecin;
