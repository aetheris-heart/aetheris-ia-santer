import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileInvoiceDollar } from "react-icons/fa6";

const AjouterFacture: React.FC = () => {
  const { token, user } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    montant_ht: "",
    taxe: "",
    type_facture: "",
    montant_total: "",
    description: "",
    statut: "en attente",
  });

  // 💡 Recalcul automatique du TTC
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "montant_ht" || name === "taxe") {
      const ht =
        name === "montant_ht" ? parseFloat(value) || 0 : parseFloat(formData.montant_ht) || 0;
      const taxe = name === "taxe" ? parseFloat(value) || 0 : parseFloat(formData.taxe) || 0;
      const ttc = ht + (ht * taxe) / 100;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        montant_total: ttc.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        patient_id: Number(formData.patient_id),
        medecin_id: user?.id || null,
        numero_facture: `FAC-${new Date().getFullYear()}-${Date.now()}`,
        montant_ht: parseFloat(formData.montant_ht),
        taxe: parseFloat(formData.taxe),
        montant_total: parseFloat(formData.montant_total),
        statut: formData.statut,
        methode_paiement: "à définir",
        reference_paiement: null,
        description: formData.description,
        notes_internes: null,
        date_emission: new Date().toISOString(),
        date_echeance: null,
        date_paiement: null,
      };

      const res = await api.post("/factures", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("✅ Facture ajoutée avec succès !");
        navigate("/finance");
      } else {
        toast.warn("⚠️ La facture a été créée, mais la réponse semble incomplète.");
      }
    } catch (error: any) {
      console.error("Erreur ajout facture :", error);
      if (error.response?.data?.detail) {
        toast.error(`❌ ${error.response.data.detail}`);
      } else {
        toast.error("❌ Impossible d’ajouter la facture (vérifie les données).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white flex flex-col items-center justify-center p-8">
      {/* 🌌 Arrière-plan animé */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%" }}
      />

      {/* 🔙 Bouton retour */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => navigate("/finance")}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
        >
          <FaArrowLeft /> Retour au module Finance
        </button>
      </div>

      {/* 🧾 Formulaire principal */}
      <motion.form
        onSubmit={handleSubmit}
        className="relative z-10 bg-gray-900/80 backdrop-blur-lg border border-yellow-600 shadow-2xl rounded-2xl p-8 w-full max-w-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center mb-6">
          <FaFileInvoiceDollar className="text-yellow-400 text-4xl mr-3" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Nouvelle Facture
          </h2>
        </div>

        {/* 🔹 Patient */}
        <label className="block text-sm mb-1">Patient ID</label>
        <input
          type="number"
          name="patient_id"
          value={formData.patient_id}
          onChange={handleChange}
          required
          placeholder="Identifiant du patient"
          className="w-full mb-4 p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
        />

        {/* 🔹 Montant HT */}
        <label className="block text-sm mb-1">Montant HT (€)</label>
        <input
          type="number"
          name="montant_ht"
          value={formData.montant_ht}
          onChange={handleChange}
          required
          placeholder="Montant hors taxes"
          className="w-full mb-4 p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
        />

        {/* 🔹 Taxe */}
        <label className="block text-sm mb-1">Taxe (%)</label>
        <input
          type="number"
          name="taxe"
          value={formData.taxe}
          onChange={handleChange}
          required
          placeholder="TVA en %"
          className="w-full mb-4 p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
        />

        {/* 🔹 Montant TTC */}
        <label className="block text-sm mb-1">Montant TTC (€)</label>
        <input
          type="number"
          name="montant_total"
          value={formData.montant_total}
          readOnly
          className="w-full mb-4 p-3 rounded-lg border border-gray-700 bg-gray-700 text-gray-300 cursor-not-allowed"
        />

        <label
  htmlFor="type_facture"
  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
>
  Type de facture
</label>

<select
  id="type_facture"
  name="type_facture"
  title="Type de facture"
  aria-label="Type de facture"
  value={formData.type_facture}
  onChange={handleChange}
  required
  className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
>
  <option value="">-- Sélectionner --</option>
  <option value="consultation">Consultation</option>
  <option value="hospitalisation">Hospitalisation</option>
  <option value="analyse">Analyse</option>
  <option value="autre">Autre</option>
</select>


        {/* 🔹 Description */}
        <label className="block text-sm mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description de la facture"
          className="w-full mb-6 p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
        />

        {/* ✅ Bouton Enregistrer */}
        <motion.button
          type="submit"
          whileHover={{ scale: loading ? 1 : 1.05 }}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-black transition relative overflow-hidden ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-400"
          }`}
        >
          {loading ? (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Enregistrement en cours...
            </motion.span>
          ) : (
            "✅ Enregistrer la facture"
          )}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default AjouterFacture;
