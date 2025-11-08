import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import type { Facture } from "@/types";
import { motion } from "framer-motion";
import { FaArrowLeft, FaFileInvoiceDollar } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";

const ModifierFacture: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Facture>>({});
  const [loading, setLoading] = useState(true);

  // 🧾 Charger la facture existante
  useEffect(() => {
    const fetchFacture = async () => {
      try {
        const res = await api.get<Facture>(`/factures/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        toast.error("❌ Impossible de charger la facture.");
        navigate("/factures");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFacture();
  }, [id, token, navigate]);

  // 🎯 Gestion du changement de champs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Sauvegarde
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/factures/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Facture modifiée avec succès !");
      navigate(`/factures/${id}`);
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de la mise à jour de la facture.");
    }
  };

  if (loading) {
    return (
      <p className="text-center text-yellow-400 mt-10 animate-pulse">
        Chargement de la facture en cours...
      </p>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white flex items-center justify-center p-8">
      {/* 🌌 Arrière-plan dynamique */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%" }}
      />

      <motion.div
        className="absolute inset-0 opacity-25"
        animate={{
          background: [
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 70%)",
            "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15), transparent 70%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🧾 Conteneur principal */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl bg-gray-900/80 backdrop-blur-lg border border-yellow-600 shadow-2xl rounded-2xl p-10"
      >
        {/* 🔝 En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FaFileInvoiceDollar className="text-yellow-400 text-4xl" />
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Modifier Facture #{id}
            </h2>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition"
          >
            <FaArrowLeft className="text-yellow-400" /> Retour
          </button>
        </div>

        {/* 🧠 Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Numéro */}
          <input
            type="text"
            name="numero_facture"
            value={formData.numero_facture || ""}
            onChange={handleChange}
            placeholder="Numéro de facture"
            className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            required
          />

          {/* Montants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              step="0.01"
              name="montant_ht"
              value={formData.montant_ht || ""}
              onChange={handleChange}
              placeholder="Montant HT (€)"
              className="p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
              required
            />
            <input
              type="number"
              step="0.01"
              name="taxe"
              value={formData.taxe || ""}
              onChange={handleChange}
              placeholder="Taxe (%)"
              className="p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="statut"
              value={formData.statut || ""}
              onChange={handleChange}
              title="Sélectionnez le statut"
              className="p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            >
              <option value="en attente">En attente</option>
              <option value="payée">Payée</option>
              <option value="partiel">Partielle</option>
              <option value="annulée">Annulée</option>
            </select>

            <select
              name="methode_paiement"
              value={formData.methode_paiement || ""}
              onChange={handleChange}
              title="Méthode de paiement"
              className="p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Non défini</option>
              <option value="CB">Carte Bancaire</option>
              <option value="Espèces">Espèces</option>
              <option value="Virement">Virement</option>
              <option value="Assurance">Assurance</option>
            </select>
          </div>

          {/* Description */}
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Description de la facture"
            className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            rows={3}
          />

          {/* Notes internes */}
          <textarea
            name="notes_internes"
            value={formData.notes_internes || ""}
            onChange={handleChange}
            placeholder="Notes internes (non visibles par le patient)"
            className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500"
            rows={3}
          />

          {/* 🔘 Bouton sauvegarde */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            className="w-full py-3 mt-6 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition flex items-center justify-center gap-2"
          >
            <FaSave /> Sauvegarder les modifications
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ModifierFacture;
