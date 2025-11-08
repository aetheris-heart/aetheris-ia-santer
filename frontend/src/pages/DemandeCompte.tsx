import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import { FaUserMd, FaEnvelope, FaFileMedical } from "react-icons/fa";

const DemandeCompte: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    specialite: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/admin/demandes", formData); // ✅ à aligner avec backend
      toast.success("📨 Demande envoyée. Un administrateur validera votre compte.");
      navigate("/login");
    } catch (error: any) {
      console.error("Erreur API:", error);

      if (error.response?.data?.detail?.includes("email")) {
        toast.error("❌ Cet email est déjà utilisé.");
      } else {
        toast.error("❌ Erreur lors de l’envoi de la demande.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white/70 dark:bg-gray-900/70 rounded-xl shadow-2xl backdrop-blur-xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-extrabold text-center text-blue-700 dark:text-white mb-6">
        📝 Demande de création de compte médecin
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prénom</label>
          <input
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FaEnvelope /> Email professionnel
          </label>
          <input
            name="email"
            type="email"
            placeholder="ex: docteur@hopital.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FaUserMd /> Spécialité médicale
          </label>
          <input
            name="specialite"
            placeholder="ex: Cardiologie"
            value={formData.specialite}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FaFileMedical /> Message / Motivation
          </label>
          <textarea
            name="message"
            placeholder="Expliquez brièvement votre demande..."
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white h-28"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? "⏳ Envoi en cours..." : "📤 Envoyer la demande"}
        </button>
      </form>
    </div>
  );
};

export default DemandeCompte;
