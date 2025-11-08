import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

const AjouterBiologie: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    patient_id: "",
    type_analyse: "",
    categorie: "Sang",
    resultats: "",
    prescripteur: "",
    effectue_par: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/biologie", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Analyse ajoutée !");
      navigate("/biologie");
    } catch {
      toast.error("❌ Erreur ajout analyse");
    }
  };

  return (
    <motion.div className="p-6 bg-transparent">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">
        ➕ Nouvelle Analyse Biologique
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white/20 dark:bg-gray-800/40 backdrop-blur-lg p-6 rounded-xl shadow-lg"
      >
        <input
          type="number"
          name="patient_id"
          placeholder="ID Patient"
          onChange={handleChange}
          className="w-full p-2 rounded bg-transparent border"
          required
        />
        <input
          type="text"
          name="type_analyse"
          placeholder="Type d’analyse (Ex: NFS)"
          onChange={handleChange}
          className="w-full p-2 rounded bg-transparent border"
          required
        />
        <select
          name="categorie"
          value={form.categorie}
          onChange={handleChange}
          className="w-full p-2 rounded bg-transparent border"
        >
          <option value="Sang">Sang</option>
          <option value="Urine">Urine</option>
          <option value="Sérologie">Sérologie</option>
        </select>
        <textarea
          name="resultats"
          placeholder="Résultats"
          onChange={handleChange}
          className="w-full p-2 rounded bg-transparent border"
        />
        <input
          type="text"
          name="prescripteur"
          placeholder="Prescripteur"
          onChange={handleChange}
          className="w-full p-2 rounded bg-transparent border"
        />
        <input
          type="text"
          name="effectue_par"
          placeholder="Effectué par"
          onChange={handleChange}
          className="w-full p-2 rounded bg-transparent border"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </form>
    </motion.div>
  );
};

export default AjouterBiologie;
