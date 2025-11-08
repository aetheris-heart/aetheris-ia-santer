import React, { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import type { Comptabilite } from "@/types";
import { motion } from "framer-motion";
import {
  FaArrowUp,
  FaArrowDown,
  FaChartPie,
  FaPlus,
  FaMoneyBillWave,
  FaArrowLeft,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface FinanceStats {
  total_revenus: number;
  total_depenses: number;
  solde_global: number;
}

const ListeCompta: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Comptabilite[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Charger les opérations et stats
  const fetchCompta = async () => {
    try {
      const res = await api.get("/finance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(res.data || []);
    } catch (error) {
      console.error("Erreur récupération comptabilité :", error);
      toast.error("❌ Impossible de charger la comptabilité.");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/finance/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Erreur récupération stats :", error);
      toast.error("❌ Impossible de charger les statistiques globales.");
    }
  };

  useEffect(() => {
    if (token) {
      Promise.all([fetchCompta(), fetchStats()]).finally(() => setLoading(false));
    }
  }, [token]);

  const safeUpper = (val?: string | null) => (val ? val.toUpperCase() : "—");
  const safeNumber = (val?: number | null) => (val ? val : 0);

  const totalRevenu = stats ? stats.total_revenus : 0;
  const totalDepense = stats ? stats.total_depenses : 0;
  const solde = stats ? stats.solde_global : 0;

  return (
    <div className="relative min-h-screen overflow-hidden text-white p-10">
      {/* 🌌 Arrière-plan */}
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
            "radial-gradient(circle at 25% 30%, rgba(255,255,255,0.15), transparent 70%)",
            "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1), transparent 70%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🧾 Contenu principal */}
      <div className="relative z-10 space-y-8">
        {/* 🔝 En-tête + Bouton Retour */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/finance")}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-yellow-500 rounded-lg bg-gray-800/60 hover:bg-gray-700 transition"
            >
              <FaArrowLeft className="text-yellow-400" />
              Retour Finance
            </button>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent flex items-center gap-3">
              <FaChartPie className="text-yellow-400" />
              Historique Comptable
            </h1>
          </div>

          <button
            onClick={() => navigate("/comptabilite/ajouter")}
            className="flex items-center gap-2 px-5 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            <FaPlus /> Ajouter une Opération
          </button>
        </div>

        {/* 📊 Indicateurs globaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/70 border border-green-500 rounded-2xl shadow-xl p-6 text-center backdrop-blur-lg"
          >
            <FaArrowUp className="text-green-400 text-3xl mx-auto mb-2" />
            <h2 className="text-gray-300 text-sm uppercase">Revenus Totaux</h2>
            <p className="text-3xl font-bold text-green-400">
              +{totalRevenu.toLocaleString("fr-FR")} €
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/70 border border-red-500 rounded-2xl shadow-xl p-6 text-center backdrop-blur-lg"
          >
            <FaArrowDown className="text-red-400 text-3xl mx-auto mb-2" />
            <h2 className="text-gray-300 text-sm uppercase">Dépenses Totales</h2>
            <p className="text-3xl font-bold text-red-400">
              -{totalDepense.toLocaleString("fr-FR")} €
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/70 border border-yellow-500 rounded-2xl shadow-xl p-6 text-center backdrop-blur-lg"
          >
            <FaMoneyBillWave className="text-yellow-400 text-3xl mx-auto mb-2" />
            <h2 className="text-gray-300 text-sm uppercase">Solde Global</h2>
            <p className={`text-3xl font-bold ${solde >= 0 ? "text-green-400" : "text-red-400"}`}>
              {solde.toLocaleString("fr-FR")} €
            </p>
          </motion.div>
        </div>

        {/* 📚 Liste des opérations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/80 border border-yellow-600 rounded-2xl shadow-lg backdrop-blur-lg p-8"
        >
          <h3 className="text-2xl font-semibold mb-6 text-yellow-500">
            📘 Historique des Opérations
          </h3>

          {loading ? (
            <p className="text-center text-yellow-400 animate-pulse">
              Chargement des données comptables...
            </p>
          ) : entries.length === 0 ? (
            <p className="text-center text-gray-400">Aucune opération enregistrée.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {entries.map((entry, index) => {
                const type = entry.type_operation || entry.type || "";
                const montant = safeNumber(entry.montant_total ?? entry.montant);
                const date = entry.date_operation
                  ? new Date(entry.date_operation).toLocaleDateString("fr-FR")
                  : "—";

                return (
                  <motion.div
                    key={entry.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/comptabilite/${entry.id}`)}
                    className={`cursor-pointer rounded-xl border ${
                      type === "revenu"
                        ? "border-green-500 hover:bg-green-900/20"
                        : "border-red-500 hover:bg-red-900/20"
                    } p-5 backdrop-blur-md shadow-md transition`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex items-center gap-2 font-semibold ${
                          type === "revenu" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {type === "revenu" ? <FaArrowUp /> : <FaArrowDown />}
                        {safeUpper(type)}
                      </span>
                      <span className="text-gray-400 text-sm">{date}</span>
                    </div>

                    <p className="text-2xl font-bold mt-3">{montant.toLocaleString("fr-FR")} €</p>

                    <p className="text-gray-400 text-sm mt-2">{entry.description || "—"}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ListeCompta;
