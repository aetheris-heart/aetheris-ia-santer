import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { FaArrowLeft, FaMoneyBillWave, FaChartPie } from "react-icons/fa6";
import { toast } from "react-toastify";

interface Comptabilite {
  id: number;
  type_operation: string;
  categorie?: string;
  description?: string;
  montant_ht: number;
  taxe: number;
  montant_total: number;
  date_operation: string;
  moyen_paiement?: string;
  statut?: string;
}

const DetailCompta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();
  const [compta, setCompta] = useState<Comptabilite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompta = async () => {
      try {
        // 🔗 Appel backend corrigé
        const res = await api.get<Comptabilite>(`/finance/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompta(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
        toast.error("❌ Impossible de charger cette opération comptable.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) fetchCompta();
  }, [id, token]);

  if (loading)
    return (
      <p className="text-center text-yellow-400 mt-10 animate-pulse">
        Chargement des données comptables...
      </p>
    );

  if (!compta)
    return (
      <p className="text-center text-red-500 mt-10">Aucune donnée trouvée pour cette opération.</p>
    );

  const estRevenu = compta.type_operation?.toLowerCase() === "revenu";

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-8 text-white">
      {/* 🌌 Fond dynamique */}
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
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl bg-gray-900/80 backdrop-blur-lg border border-blue-600 shadow-2xl rounded-2xl p-10"
      >
        {/* 🔝 En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FaChartPie className="text-blue-400 text-4xl" />
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Détail de l’Opération Comptable
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition"
          >
            <FaArrowLeft className="text-blue-400" /> Retour
          </button>
        </div>

        {/* 💼 Détails de l’opération */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/70 border border-gray-700 rounded-xl p-8 space-y-4"
        >
          <div className="flex items-center gap-3">
            <FaMoneyBillWave
              className={`text-4xl ${estRevenu ? "text-green-400" : "text-red-400"}`}
            />
            <h2 className={`text-2xl font-bold ${estRevenu ? "text-green-400" : "text-red-400"}`}>
              {estRevenu ? "Revenu 💰" : "Dépense 📉"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-700">
              <p className="text-gray-400 text-sm">Montant HT</p>
              <p className="text-2xl font-semibold text-yellow-400">
                {compta.montant_ht.toLocaleString()} €
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-700">
              <p className="text-gray-400 text-sm">Montant TTC</p>
              <p className="text-2xl font-semibold text-yellow-400">
                {compta.montant_total.toLocaleString()} €
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-700">
              <p className="text-gray-400 text-sm">Taxe</p>
              <p className="text-lg font-medium">{compta.taxe}%</p>
            </div>

            <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-700">
              <p className="text-gray-400 text-sm">Date de l’opération</p>
              <p className="text-lg font-medium">
                {new Date(compta.date_operation).toLocaleDateString("fr-FR")}
              </p>
            </div>

            {compta.categorie && (
              <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-700 md:col-span-2">
                <p className="text-gray-400 text-sm">Catégorie</p>
                <p className="text-lg font-medium">{compta.categorie}</p>
              </div>
            )}

            {compta.description && (
              <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-700 md:col-span-2">
                <p className="text-gray-400 text-sm">Description</p>
                <p className="text-lg">{compta.description}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DetailCompta;
