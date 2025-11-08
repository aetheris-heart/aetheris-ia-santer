import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaPills } from "react-icons/fa";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

const ModifierPharmacie: React.FC = () => {
  const { token } = useUser();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Champs
  const [nom, setNom] = useState("");
  const [forme, setForme] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantite, setQuantite] = useState(0);
  const [seuilAlerte, setSeuilAlerte] = useState(10);
  const [datePeremption, setDatePeremption] = useState("");
  const [lot, setLot] = useState("");
  const [fournisseur, setFournisseur] = useState("");
  const [prixAchat, setPrixAchat] = useState<number | undefined>(undefined);
  const [prixVente, setPrixVente] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Charger les données existantes
  useEffect(() => {
    if (!token || !id) return;
    api
      .get(`/pharmacie/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const data = res.data;
        setNom(data.nom);
        setForme(data.forme);
        setDosage(data.dosage || "");
        setQuantite(data.quantite || 0);
        setSeuilAlerte(data.seuil_alerte || 10);
        setDatePeremption(data.date_peremption ? data.date_peremption.split("T")[0] : "");
        setLot(data.lot || "");
        setFournisseur(data.fournisseur || "");
        setPrixAchat(data.prix_achat || undefined);
        setPrixVente(data.prix_vente || undefined);
        setDescription(data.description || "");
      })
      .catch(() => toast.error("❌ Impossible de charger le médicament"));
  }, [id, token]);

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) {
      toast.error("🔒 Authentification requise");
      return;
    }

    setLoading(true);
    try {
      await api.put(
        `/pharmacie/${id}`,
        {
          nom,
          forme,
          dosage,
          quantite,
          seuil_alerte: seuilAlerte,
          date_peremption: datePeremption || null,
          lot,
          fournisseur,
          prix_achat: prixAchat,
          prix_vente: prixVente,
          description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Médicament modifié avec succès !");
      navigate("/pharmacie");
    } catch (err: any) {
      console.error("❌ Erreur modification médicament :", err);
      toast.error("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-8 min-h-screen bg-transparent backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Retour */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow hover:scale-105 transition"
      >
        <FaArrowLeft /> Retour
      </button>

      {/* Formulaire */}
      <div className="bg-white/20 dark:bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <FaPills /> Modifier Médicament
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium">Nom *</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Forme + Dosage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Forme *</label>
              <input
                type="text"
                value={forme}
                onChange={(e) => setForme(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Dosage</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Quantité + Seuil */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Quantité *</label>
              <input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Seuil d’alerte</label>
              <input
                type="number"
                value={seuilAlerte}
                onChange={(e) => setSeuilAlerte(Number(e.target.value))}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Date de péremption */}
          <div>
            <label className="block text-sm font-medium">Date de péremption</label>
            <input
              type="date"
              value={datePeremption}
              onChange={(e) => setDatePeremption(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Lot + Fournisseur */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Lot</label>
              <input
                type="text"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fournisseur</label>
              <input
                type="text"
                value={fournisseur}
                onChange={(e) => setFournisseur(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Prix achat + vente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Prix d’achat</label>
              <input
                type="number"
                value={prixAchat ?? ""}
                onChange={(e) => setPrixAchat(Number(e.target.value))}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Prix de vente</label>
              <input
                type="number"
                value={prixVente ?? ""}
                onChange={(e) => setPrixVente(Number(e.target.value))}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
            bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ModifierPharmacie;
