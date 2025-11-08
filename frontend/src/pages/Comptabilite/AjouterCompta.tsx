import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaMoneyBillWave, FaArrowLeft, FaFloppyDisk } from "react-icons/fa6"; // ✅ Correction icône

const AjouterCompta: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  // ✅ Formulaire aligné avec ton schéma FinanceCreate
  const [formData, setFormData] = useState({
    type_operation: "revenu",
    categorie: "",
    description: "",
    montant_ht: "",
    taxe: "0",
    montant_total: "",
    moyen_paiement: "",
    statut: "enregistré",
    facture_id: "",
    medecin_id: "",
  });

  // ✅ Gestion des champs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 🔍 Conversion en nombres pour éviter le 422
      const montantHT = parseFloat(formData.montant_ht) || 0;
      const taxe = parseFloat(formData.taxe) || 0;
      const montantTotal = parseFloat(formData.montant_total) || montantHT * (1 + taxe / 100);

      // 🧩 Payload envoyé au backend
      const payload = {
        type_operation: formData.type_operation,
        categorie: formData.categorie || null,
        description: formData.description || null,
        montant_ht: montantHT,
        taxe: taxe,
        montant_total: montantTotal,
        moyen_paiement: formData.moyen_paiement || null,
        statut: formData.statut || "enregistré",
        facture_id: formData.facture_id ? parseInt(formData.facture_id) : null,
        medecin_id: formData.medecin_id ? parseInt(formData.medecin_id) : null,
      };

      console.log("✅ Payload envoyé :", payload); // 🧠 Vérification

      const res = await api.post("/finance/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Réponse API :", res.data);

      toast.success("✅ Opération comptable enregistrée avec succès !");
      navigate("/comptabilite");
    } catch (error: any) {
      console.error("❌ Erreur ajout compta :", error.response?.data || error.message);
      toast.error("Erreur lors de l’enregistrement de l’opération.");
    }
  };

  // 🖼️ Interface
  return (
    <div className="relative min-h-screen overflow-hidden text-white p-10 flex items-center justify-center">
      {/* 🌌 Fond dynamique */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%" }}
      />

      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 70%)",
            "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15), transparent 70%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 💰 Conteneur principal */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl bg-gray-900/80 border border-yellow-600 backdrop-blur-lg shadow-2xl rounded-2xl p-10"
      >
        {/* 🔝 En-tête */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent flex items-center gap-2">
            <FaMoneyBillWave className="text-yellow-500" />
            Ajouter une Opération Financière
          </h1>
          <button
            onClick={() => navigate("/finance")}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition"
          >
            <FaArrowLeft className="text-yellow-400" /> Retour Finance
          </button>
        </div>

        {/* 🧾 Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type d’opération */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Type d'opération</label>
            <select
              name="type_operation"
              value={formData.type_operation}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            >
              <option value="revenu">💵 Revenu</option>
              <option value="dépense">💸 Dépense</option>
            </select>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Catégorie</label>
            <input
              type="text"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              placeholder="Ex : achat matériel, subvention, etc."
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Montants */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Montant HT (€)</label>
              <input
                type="number"
                name="montant_ht"
                value={formData.montant_ht}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Taxe (%)</label>
              <input
                type="number"
                name="taxe"
                value={formData.taxe}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Montant TTC (€)</label>
              <input
                type="number"
                name="montant_total"
                value={formData.montant_total}
                onChange={handleChange}
                placeholder="Auto si vide"
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Moyen de paiement */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Moyen de paiement</label>
            <select
              name="moyen_paiement"
              value={formData.moyen_paiement}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">-- Choisir --</option>
              <option value="virement">Virement</option>
              <option value="espèces">Espèces</option>
              <option value="carte bancaire">Carte bancaire</option>
              <option value="chèque">Chèque</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Détails de l'opération (ex : achat matériel médical)"
              required
              rows={3}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* ✅ Bouton enregistrer */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            className="w-full py-3 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition flex items-center justify-center gap-2"
          >
            <FaFloppyDisk /> Enregistrer l'opération
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AjouterCompta;
