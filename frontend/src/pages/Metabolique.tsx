import React, { useEffect, useState, useMemo } from "react";
import api from "@/components/lib/axios";
import MetaboliqueDiagram from "@/components/diagrams/Metaboliquediagram";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { Activity, Sparkles } from "lucide-react";

// 🧠 Image schéma
const metaboliqueImage = "/assets/metabolique.png";

// 🧬 Typage des données
interface MetabolicStats {
  glucose: number | string | null;
  insuline: number | string | null;
  niveau_risque?: string | null;
  anomalies_detectees?: string | null;
  score_sante?: number | string | null;
  historique?: { date: string; glucose: number }[];
}

// 🔹 Fonction de sécurisation des nombres
const safeNumber = (val: any, precision = 1): string =>
  typeof val === "number"
    ? val.toFixed(precision)
    : typeof val === "string" && !isNaN(parseFloat(val))
    ? parseFloat(val).toFixed(precision)
    : "—";

const Metabolique: React.FC = () => {
  const [data, setData] = useState<MetabolicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token manquant");

        const res = await api.get<MetabolicStats>("/dashboard/stats/metabolic", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch (err) {
        console.error("❌ Erreur récupération données métaboliques :", err);
        toast.error("Erreur : données métaboliques introuvables");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // 🎨 Couleur du risque IA
  const riskColor = useMemo(() => {
    switch (data?.niveau_risque) {
      case "Critique":
        return "#ef4444";
      case "Élevé":
        return "#f97316";
      case "Modéré":
        return "#eab308";
      default:
        return "#22c55e";
    }
  }, [data?.niveau_risque]);

  // 📈 Graphique
  const chartData =
    data?.historique?.map((item) => ({
      time: item.date,
      glucose: item.glucose,
    })) ?? [];

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-emerald-400">
        ⏳ Chargement de l’analyse métabolique...
      </div>
    );

  if (!data)
    return (
      <div className="text-center text-red-500 mt-10">
        ❌ Impossible de charger les données métaboliques.
      </div>
    );

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 💫 Halo IA métabolique */}
      <motion.div
        className="fixed top-0 left-0 w-[25rem] h-[25rem] rounded-full blur-3xl opacity-30 -z-10"
        style={{ background: riskColor }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* 🧠 Titre principal */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 mb-6"
      >
        🧬 Fonction Métabolique — AETHERIS IA
      </motion.h1>

      {/* 🧠 Bloc d’analyse IA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/60 dark:bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-emerald-400/30 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Sparkles className="text-emerald-400" /> Analyse intelligente Aetheris
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Glucose sanguin</p>
            <p className="text-2xl font-bold text-emerald-600">
              {safeNumber(data.glucose, 1)} mg/dL
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Insuline</p>
            <p className="text-2xl font-bold text-blue-500">{safeNumber(data.insuline, 1)} µU/mL</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Score santé IA</p>
            <p
              className={`text-2xl font-bold ${
                Number(data.score_sante) < 60 ? "text-red-500" : "text-green-500"
              }`}
            >
              {safeNumber(data.score_sante, 0)} %
            </p>
          </div>

          <div className="col-span-2 md:col-span-3 mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Niveau de risque métabolique</p>
            <p className="text-xl font-semibold" style={{ color: riskColor }}>
              {data.niveau_risque ?? "Non défini"}
            </p>
          </div>

          {data.anomalies_detectees && (
            <div className="col-span-2 md:col-span-3 mt-2">
              <p className="italic text-sm text-red-500 dark:text-red-400">
                {data.anomalies_detectees}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 📊 Graphique d’évolution */}
      <CardGraph data={chartData} />

      {/* 🧩 Schéma métabolique dynamique */}
      <CardDiagram
        glucose={Number(data.glucose) || 0}
        insuline={Number(data.insuline) || 0}
        niveau_risque={data.niveau_risque ?? "Non défini"}
        image={metaboliqueImage}
      />

      {/* 🧠 Synthèse IA */}
      <motion.div
        className="mt-10 p-6 text-center text-white bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-semibold mb-2">🧠 Synthèse IA métabolique</h2>
        <p className="text-sm opacity-90">
          Glucose {Number(data.glucose) > 110 ? "élevé" : "normal"}, insuline{" "}
          {Number(data.insuline) > 25 ? "hyperinsulinémie détectée" : "normale"}. <br />
          État global : <strong>{data.niveau_risque ?? "Stable"}</strong>. Surveillance IA continue activée.
        </p>
      </motion.div>

      {/* 🔙 Retour */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gradient-to-r from-emerald-500 to-green-700 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:scale-105 transition"
        >
          ← Retour au tableau de bord
        </button>
      </div>
    </motion.div>
  );
};

// ================================
// 📊 Sous-composant : graphique
// ================================
const CardGraph: React.FC<{ data: any[] }> = ({ data }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="w-full h-64 bg-white/60 dark:bg-gray-900/60 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-8"
  >
    {data.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
          <Line type="monotone" dataKey="glucose" stroke="#10b981" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-center text-gray-400 mt-8">Aucune donnée d’historique.</p>
    )}
  </motion.div>
);

// ================================
// 🧩 Sous-composant : schéma
// ================================
const CardDiagram: React.FC<{
  glucose: number;
  insuline: number;
  niveau_risque?: string;
  image: string;
}> = ({ glucose, insuline, niveau_risque, image }) => (
  <motion.div
    className="p-6 bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-xl border border-emerald-400/20"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
      <Activity className="text-emerald-400" /> Simulation organique — Aetheris IA
    </h2>

    <MetaboliqueDiagram
      glucose={glucose}
      insuline={insuline}
      niveau_risque={niveau_risque ?? "Non défini"}
      image={image}
    />

    <div className="w-full h-52 mt-6 overflow-hidden rounded-xl">
      <img
        src={image}
        alt="Schéma métabolique"
        className="object-cover w-full h-full opacity-90 hover:opacity-100 transition"
      />
    </div>
  </motion.div>
);

export default Metabolique;
