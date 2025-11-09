import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Sliders,
  Wifi,
  Moon,
  Sun,
  RefreshCw,
  Save,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

/**
 * ⚙️ VisualIASettings – Aetheris Visual Intelligence
 * Configuration dynamique du moteur visuel hospitalier Aetheris.
 */
const VisualIASettings: React.FC = () => {
  const { token } = useUser();

  const [autoMode, setAutoMode] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(90);
  const [refreshInterval, setRefreshInterval] = useState(15);
  const [darkMode, setDarkMode] = useState(true);
  const [iaStatus, setIaStatus] = useState<"active" | "standby">("active");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🧩 Charger les réglages existants
  const fetchSettings = async () => {
    try {
      const res = await api.get("/modules-ia/visual-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setAutoMode(res.data.autoMode);
        setConfidenceThreshold(res.data.confidenceThreshold);
        setRefreshInterval(res.data.refreshInterval);
        setDarkMode(res.data.darkMode);
        setIaStatus(res.data.iaStatus);
      }
    } catch (error) {
      console.warn("⚠️ Aucun réglage IA trouvé. Valeurs par défaut appliquées.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  // 💾 Sauvegarde vers le backend
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put(
        "/modules-ia/visual-settings",
        {
          autoMode,
          confidenceThreshold,
          refreshInterval,
          darkMode,
          iaStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Paramètres IA enregistrés avec succès !");
      console.log("Réponse Aetheris Visual:", res.data);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      toast.error("❌ Échec de l’enregistrement des paramètres IA.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-cyan-400 text-lg">
        <Cpu className="w-6 h-6 mr-2 animate-spin" /> Chargement des réglages IA...
      </div>
    );

  return (
    <motion.div
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-900"
      } p-10 transition-all duration-700`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🧠 En-tête */}
      <div className="flex flex-col items-center mb-10 text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          <Brain className="w-16 h-16 text-cyan-400 drop-shadow-lg mb-2" />
        </motion.div>
        <h1 className="text-4xl font-bold text-cyan-400 tracking-wide">
          AETHERIS VISUAL ENGINE SETTINGS
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-2xl">
          Configurez les paramètres d’analyse visuelle du moteur Aetheris pour une précision
          maximale, une réactivité intelligente et un confort visuel optimal.
        </p>
      </div>

      {/* ⚙️ Bloc principal */}
      <motion.div
        className="max-w-5xl mx-auto backdrop-blur-2xl bg-white/10 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 🧩 Statut du moteur IA */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Wifi
              className={`w-6 h-6 ${iaStatus === "active" ? "text-green-400" : "text-yellow-400"}`}
            />
            <div>
              <h2 className="font-semibold text-lg text-white">État du moteur Aetheris</h2>
              <p className="text-gray-400 text-sm">
                {iaStatus === "active"
                  ? "🟢 Aetheris Visual Core surveille activement les nouvelles analyses."
                  : "🟡 En veille — activation manuelle requise."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIaStatus(iaStatus === "active" ? "standby" : "active")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              iaStatus === "active"
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
            }`}
          >
            {iaStatus === "active" ? "Mettre en veille" : "Activer"}
          </button>
        </div>

        {/* ⚙️ Mode automatique */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="font-semibold text-lg text-white">Mode d’analyse automatique</h2>
              <p className="text-gray-400 text-sm">
                Autorise Aetheris à exécuter des analyses en continu dès réception de nouvelles
                données.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              autoMode
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30"
            }`}
          >
            {autoMode ? "Activé" : "Désactivé"}
          </button>
        </div>

        {/* 🔬 Seuil de confiance */}
        <div>
          <h2 className="font-semibold text-lg mb-2 text-white">
            🔬 Seuil minimal de confiance IA
          </h2>
          <input
            type="range"
            min="70"
            max="99"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <p className="mt-2 text-gray-300 text-sm">
            Niveau actuel :{" "}
            <span className="text-cyan-400 font-semibold">{confidenceThreshold}%</span>
          </p>
        </div>

        {/* ⏱️ Fréquence d’analyse */}
<div>
  <h2 className="font-semibold text-lg mb-2 text-white">
    ⏱️ Fréquence d’analyse automatique
  </h2>

  {/* ✅ Label invisible pour accessibilité */}
  <label htmlFor="refresh_interval" className="sr-only">
    Choisir la fréquence d’analyse automatique
  </label>

  <select
    id="refresh_interval" // ✅ identifiant lié au label
    value={refreshInterval}
    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
    aria-label="Fréquence d’analyse automatique" // ✅ nom accessible explicite
    className="w-full bg-white/10 border border-white/20 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
  >
    <option value={10}>Toutes les 10 secondes</option>
    <option value={15}>Toutes les 15 secondes</option>
    <option value={30}>Toutes les 30 secondes</option>
    <option value={60}>Toutes les 60 secondes</option>
  </select>
</div>


        {/* 🌙 Mode visuel */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-6 h-6 text-yellow-300" />
            ) : (
              <Sun className="w-6 h-6 text-yellow-500" />
            )}
            <div>
              <h2 className="font-semibold text-lg text-white">Mode d’affichage</h2>
              <p className="text-gray-400 text-sm">
                Ajustez le mode visuel selon les conditions lumineuses.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              darkMode
                ? "bg-gray-700/40 text-gray-100 hover:bg-gray-700/60"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            }`}
          >
            {darkMode ? "🌙 Sombre" : "☀️ Clair"}
          </button>
        </div>

        {/* 💾 Sauvegarde */}
        <div className="flex justify-center pt-8 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-lg text-white font-semibold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Enregistrement en cours..." : "Enregistrer les paramètres"}
          </button>
        </div>
      </motion.div>

      {/* Signature IA */}
      <div className="mt-10 text-center text-gray-500 text-sm">
        <CheckCircle2 className="inline w-4 h-4 text-cyan-400 mr-1" />
        Aetheris Visual Intelligence v3.0 👑
      </div>
    </motion.div>
  );
};

export default VisualIASettings;
