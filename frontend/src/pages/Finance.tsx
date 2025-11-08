import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui/ui_card";
import {
  FaArrowLeft,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaMoneyBillWave,
  FaChevronDown,
  FaChevronUp,
  FaFileInvoiceDollar,
  FaCalculator,
  FaPlus,
  FaList,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface EvolutionData {
  mois: string;
  revenus: number;
  depenses: number;
}

interface FinanceStats {
  total_revenus: number;
  total_depenses: number;
  solde_global: number;
  evolution: EvolutionData[];
}

const Finance: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFacturesMenu, setShowFacturesMenu] = useState(false);
  const [showComptaMenu, setShowComptaMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 🔒 Fermer les menus si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowFacturesMenu(false);
        setShowComptaMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔄 Charger les statistiques réelles du backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<FinanceStats>("/finance/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Erreur chargement données financières :", error);
        toast.error("❌ Impossible de charger les statistiques financières.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  if (loading)
    return (
      <div className="text-center text-yellow-400 mt-20 text-lg">
        Chargement des données financières...
      </div>
    );

  if (!stats)
    return <div className="text-center text-red-400 mt-20 text-lg">Aucune donnée disponible.</div>;

  const totalRevenus = stats.total_revenus ?? 0;
  const totalDepenses = stats.total_depenses ?? 0;
  const solde = stats.solde_global ?? 0;
  const evolution = stats.evolution ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden text-white p-10">
      {/* 🌌 Arrière-plan animé */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%" }}
      />

      {/* 🔙 Bouton retour */}
      <div className="relative z-10 flex items-center mb-8">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
        >
          <FaArrowLeft /> Retour au tableau de bord
        </button>
      </div>

      {/* === Titre principal === */}
      <motion.div
        className="relative z-10 text-center space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          💰 Aetheris – Module Finance & Comptabilité
        </h1>
      </motion.div>

      {/* === Contenu principal === */}
      <motion.div
        className="relative z-10 space-y-10 mt-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 🧮 Cartes Résumé globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/70 border border-green-500 rounded-2xl shadow-xl">
            <CardContent className="flex flex-col items-center p-6">
              <FaArrowTrendUp className="text-green-400 text-4xl mb-2" />
              <h2 className="text-lg text-gray-300">Revenus Totaux</h2>
              <p className="text-3xl font-bold text-green-400">
                +{totalRevenus.toLocaleString("fr-FR")} €
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/70 border border-red-500 rounded-2xl shadow-xl">
            <CardContent className="flex flex-col items-center p-6">
              <FaArrowTrendDown className="text-red-400 text-4xl mb-2" />
              <h2 className="text-lg text-gray-300">Dépenses Totales</h2>
              <p className="text-3xl font-bold text-red-400">
                -{totalDepenses.toLocaleString("fr-FR")} €
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/70 border border-yellow-500 rounded-2xl shadow-xl">
            <CardContent className="flex flex-col items-center p-6">
              <FaMoneyBillWave className="text-yellow-400 text-4xl mb-2" />
              <h2 className="text-lg text-gray-300">Solde Global</h2>
              <p className={`text-3xl font-bold ${solde >= 0 ? "text-green-400" : "text-red-400"}`}>
                {solde.toLocaleString("fr-FR")} €
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 📊 Graphique réel d'évolution */}
        <Card className="bg-gray-900/70 border border-yellow-600 p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-yellow-500">
            📈 Évolution Financière (6 derniers mois)
          </h3>
          {evolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={evolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="mois" stroke="#ccc" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenus" fill="#22c55e" name="Revenus (€)" />
                <Bar dataKey="depenses" fill="#ef4444" name="Dépenses (€)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center mt-10">Aucune donnée d’évolution disponible.</p>
          )}
        </Card>

        {/* 📈 Mini prévision IA basée sur tendance */}
        <Card className="bg-gray-900/70 border border-blue-600 p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-blue-400">
            🤖 Prévision IA – Tendance des Revenus
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={evolution.map((e, i) => ({
                mois: e.mois,
                prediction: e.revenus * (1 + i * 0.05), // légère croissance simulée
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mois" stroke="#ccc" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="prediction"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 5, stroke: "#38bdf8", strokeWidth: 2, fill: "#0ea5e9" }}
                name="Prévision IA (€)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* === Boutons lumineux Aetheris === */}
      <div
        ref={menuRef}
        className="flex justify-center gap-8 mt-10 flex-wrap relative overflow-visible z-50"
      >
        {/* Factures */}
        <div className="relative overflow-visible">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setShowFacturesMenu(!showFacturesMenu);
              setShowComptaMenu(false);
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px 5px rgba(34,197,94,0.5)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl shadow-lg relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 opacity-40 blur-xl"
              style={{
                background: "radial-gradient(circle, rgba(34,197,94,0.6), transparent 70%)",
              }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <FaFileInvoiceDollar /> Factures
              {showFacturesMenu ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </motion.button>

          <AnimatePresence>
            {showFacturesMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-gray-900/95 border border-green-500 rounded-lg shadow-2xl z-[9999] backdrop-blur-md"
              >
                <button
                  onClick={() => {
                    navigate("/factures");
                    setShowFacturesMenu(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-green-400 hover:bg-gray-800 transition"
                >
                  <FaList /> Liste des factures
                </button>
                <button
                  onClick={() => {
                    navigate("/factures/nouvelle");
                    setShowFacturesMenu(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-green-300 hover:bg-gray-800 transition"
                >
                  <FaPlus /> Ajouter une facture
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comptabilité */}
        <div className="relative overflow-visible">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setShowComptaMenu(!showComptaMenu);
              setShowFacturesMenu(false);
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px 5px rgba(59,130,246,0.5)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 opacity-40 blur-xl"
              style={{
                background: "radial-gradient(circle, rgba(59,130,246,0.6), transparent 70%)",
              }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <FaCalculator /> Comptabilité
              {showComptaMenu ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </motion.button>

          <AnimatePresence>
            {showComptaMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-gray-900/95 border border-blue-500 rounded-lg shadow-2xl z-[9999] backdrop-blur-md"
              >
                <button
                  onClick={() => {
                    navigate("/comptabilite");
                    setShowComptaMenu(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-blue-400 hover:bg-gray-800 transition"
                >
                  <FaList /> Détail comptable
                </button>
                <button
                  onClick={() => {
                    navigate("/comptabilite/ajouter");
                    setShowComptaMenu(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-blue-300 hover:bg-gray-800 transition"
                >
                  <FaPlus /> Ajouter une opération
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Finance;
