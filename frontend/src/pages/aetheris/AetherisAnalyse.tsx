import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Brain, ArrowLeft, Sparkles, FileText } from "lucide-react";

interface AetherisAnalysis {
  id: number;
  patient_id: number;
  diagnostic: string;
  prediction: string;
  plan: string;
  recommendation: string;
  disclaimer: string;
  created_at: string;
}

const AetherisAnalyse: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [analyse, setAnalyse] = useState<AetherisAnalysis | null>(null);
  const [historique, setHistorique] = useState<AetherisAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // 🎨 Détection automatique du mode clair/sombre
  useEffect(() => {
    const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDark ? "dark" : "light");
  }, []);

  /// 🧠 Récupération de l’analyse et de l’historique
  useEffect(() => {
    if (!token || !patientId) return;

    const fetchData = async () => {
      try {
        // 🔹 1. Analyse existante ou génération automatique
        const res = await api.get(`/analyse-ia/analysis-or-generate/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // L’analyse est renvoyée dans res.data.analyse
        setAnalyse(res.data.analyse);

        // 🔹 2. Historique des analyses du patient
        const histoRes = await api.get(`/analyse-ia/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistorique(histoRes.data);
      } catch (err: unknown) {
        console.error("Erreur Aetheris Analyse :", err);
        toast.error("❌ Impossible de charger ou générer l’analyse Aetheris IA du patient.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, patientId]);

  // 💫 États intermédiaires
  if (loading)
    return (
      <p className="text-center text-gray-400 mt-20 animate-pulse">
        Chargement de l’analyse Aetheris IA...
      </p>
    );

  if (!analyse)
    return (
      <div className="text-center text-gray-500 mt-20">
        <p>Aucune analyse disponible pour ce patient.</p>
      </div>
    );

  const date = new Date(analyse.created_at).toLocaleString("fr-FR");

  return (
    <div
      className={`min-h-screen p-8 transition-colors duration-700 ${
        theme === "dark"
          ? "bg-gradient-to-br from-[#0a0f1c] via-[#111827] to-[#1f2937] text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-slate-100 text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto relative">
        {/* 🧠 En-tête */}
        <div className="flex justify-between items-center mb-10">
          <h1
            className={`text-4xl font-extrabold flex items-center gap-3 ${
              theme === "dark" ? "text-indigo-400" : "text-indigo-700"
            }`}
          >
            <Brain size={40} /> Analyse Aetheris IA
          </h1>
          <button
            onClick={() => navigate("/aetheris")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
                       rounded-full text-white font-semibold shadow-lg transition"
          >
            <ArrowLeft /> Retour
          </button>
        </div>

        {/* 🩺 Sections principales */}
        {[
          { title: "Diagnostic Aetheris", text: analyse.diagnostic, color: "indigo" },
          { title: "Prédiction IA", text: analyse.prediction, color: "purple" },
          { title: "Plan d’action médical", text: analyse.plan, color: "green" },
          { title: "Recommandations IA", text: analyse.recommendation, color: "yellow" },
        ].map((section, i) => (
          <motion.div
            key={`section-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className={`rounded-2xl p-6 mb-6 border shadow-xl backdrop-blur-xl ${
              theme === "dark"
                ? `bg-white/10 border-${section.color}-500/30`
                : `bg-${section.color}-50 border-${section.color}-300`
            }`}
          >
            <h3
              className={`text-xl font-semibold mb-2 ${
                theme === "dark" ? `text-${section.color}-300` : `text-${section.color}-700`
              }`}
            >
              {section.title}
            </h3>
            <p className="leading-relaxed whitespace-pre-wrap">{section.text}</p>
          </motion.div>
        ))}

        {/* ⚖️ Disclaimer */}
        <motion.div
          key="disclaimer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`mt-6 rounded-2xl p-4 text-center text-sm italic shadow-md ${
            theme === "dark"
              ? "bg-white/5 border border-gray-700 text-gray-400"
              : "bg-gray-100 border border-gray-300 text-gray-600"
          }`}
        >
          {analyse.disclaimer}
          <br />
          <span className="text-gray-500">({date})</span>
        </motion.div>

        {/* 📈 Historique des analyses */}
        {historique.length > 1 && (
          <motion.div
            key="historique"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`mt-10 rounded-2xl p-6 shadow-lg border backdrop-blur-xl ${
              theme === "dark" ? "bg-white/10 border-gray-700" : "bg-white border-gray-300"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-700"
              }`}
            >
              <Sparkles /> Historique des analyses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={historique.map((a) => ({
                  date: new Date(a.created_at).toLocaleDateString("fr-FR"),
                  id: a.id,
                }))}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === "dark" ? "#374151" : "#CBD5E1"}
                />
                <XAxis dataKey="date" tick={{ fill: theme === "dark" ? "#9CA3AF" : "#475569" }} />
                <YAxis tick={{ fill: theme === "dark" ? "#9CA3AF" : "#475569" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#f1f5f9",
                    border: "1px solid #4b5563",
                    color: theme === "dark" ? "#fff" : "#000",
                  }}
                />
                <Line type="monotone" dataKey="id" stroke="#6366F1" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* 📤 Export PDF (optionnel) */}
        <div className="text-center mt-10">
          <button
            onClick={() => toast.info("📄 Export PDF en préparation...")}
            className="flex items-center gap-2 mx-auto px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 
                       hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg transition"
          >
            <FileText size={18} /> Exporter en PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default AetherisAnalyse;
