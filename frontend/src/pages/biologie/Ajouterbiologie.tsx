import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

const AjouterBiologie: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  // ✅ State du formulaire typé
  const [form, setForm] = useState({
    patient_id: "",
    type_analyse: "",
    categorie: "Sang",
    resultats: "",
    prescripteur: "",
    effectue_par: "",
  });

  // ✅ Gestion du changement des champs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/biologie", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Analyse biologique ajoutée avec succès !");
      navigate("/biologie");
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de l’ajout de l’analyse");
    }
  };

  return (
    <motion.div
      className="p-6 max-w-2xl mx-auto bg-white/30 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">
        ➕ Nouvelle Analyse Biologique
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 🧍‍♂️ ID Patient */}
        <input
          type="number"
          name="patient_id"
          placeholder="ID du patient"
          value={form.patient_id}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
        />

        {/* 🧪 Type d’analyse */}
        <input
          type="text"
          name="type_analyse"
          placeholder="Type d’analyse (ex : NFS, Glycémie...)"
          value={form.type_analyse}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
        />

        {/* 🧬 Catégorie */}
        <div>
          <label
            htmlFor="categorie"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Catégorie biologique
          </label>
          <select
            id="categorie"
            name="categorie"
            value={form.categorie}
            onChange={handleChange}
            required
            aria-label="Catégorie biologique"
            className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-green-400"
          >
            <option value="Sang">🩸 Analyse de sang</option>
            <option value="Urine">💧 Analyse d’urine</option>
            <option value="Autre">🧪 Autre</option>
          </select>
        </div>

        {/* 📊 Résultats */}
        <textarea
          name="resultats"
          placeholder="Résultats de l’analyse"
          value={form.resultats}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
          rows={4}
        />

        {/* 👨‍⚕️ Prescripteur */}
        <input
          type="text"
          name="prescripteur"
          placeholder="Médecin prescripteur"
          value={form.prescripteur}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
        />

        {/* 👩‍🔬 Effectué par */}
        <input
          type="text"
          name="effectue_par"
          placeholder="Effectué par (laborantin, IA, etc.)"
          value={form.effectue_par}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
        />

        {/* ✅ Bouton d’enregistrement */}
        <button
          type="submit"
          className="w-full py-3 mt-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Enregistrer l’analyse
        </button>
      </form>
    </motion.div>
  );
};

export default AjouterBiologie;
