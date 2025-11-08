import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ActivitySquare, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AetherisChat from "@/components/ia/AetherisChat";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

interface StatsOverview {
  patients_total: number;
  medecins_total: number;
  consultations_total: number;
  alertes_total: number;
  derniers_patients: { id: number; nom: string; prenom: string; email: string }[];
  derniers_medecins: { id: number; nom: string; prenom: string; specialite: string }[];
}

const Aetheris: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [langue, setLangue] = useState("Français");

  // 🧠 Chargement des stats et langue IA
  useEffect(() => {
    document.title = "Aetheris — Intelligence Médicale";
    const fetchStats = async () => {
      try {
        const res = await api.get<StatsOverview>("/dashboard/stats/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("❌ Erreur stats Aetheris :", err);
        toast.error("Impossible de charger les statistiques du réseau cognitif.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  // ⚙️ Génération d’analyse IA
  const handleAnalysePatient = async (patientId: number) => {
    try {
      setAnalyzing(patientId);
      toast.info("🧠 Analyse Aetheris IA en cours...");
      await api.post(
        `/aetheris/generate/${patientId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ Analyse IA générée avec succès !");
      setTimeout(() => navigate(`/aetheris/analyse/${patientId}`), 800);
    } catch (err) {
      console.error("Erreur Aetheris :", err);
      toast.error("❌ Échec de l’analyse Aetheris IA.");
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="min-h-screen w-full p-10 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-[#0a0a12] dark:via-[#111827] dark:to-[#1f2937] text-gray-900 dark:text-white transition-all duration-700">
      {/* 🌐 Conteneur principal */}
      <div className="max-w-7xl mx-auto backdrop-blur-3xl bg-white/10 dark:bg-gray-800/40 border border-gray-300/20 dark:border-gray-600/30 rounded-3xl shadow-2xl p-10">
        {/* 🧠 Titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-7xl font-extrabold bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400 text-transparent bg-clip-text drop-shadow-[0_0_25px_#7dd3fc]">
            AETHERIS
          </h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 italic">
            “Système cognitif médical universel — pensée, empathie et analyse clinique intégrée.”
          </p>
          <p className="mt-2 text-sm text-cyan-400">
            Langue détectée : <b>{langue}</b>
          </p>
        </motion.div>

        {/* 📊 Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {loading ? (
            <p className="col-span-4 text-center text-gray-500 animate-pulse">
              Chargement du réseau cognitif...
            </p>
          ) : stats ? (
            <>
              {[
                {
                  label: "👩‍⚕️ Médecins",
                  value: stats.medecins_total,
                  color: "from-indigo-500 to-violet-500",
                },
                {
                  label: "🧍 Patients",
                  value: stats.patients_total,
                  color: "from-cyan-400 to-teal-400",
                },
                {
                  label: "📋 Consultations",
                  value: stats.consultations_total,
                  color: "from-amber-400 to-orange-500",
                },
                {
                  label: "⚠️ Alertes",
                  value: stats.alertes_total,
                  color: "from-rose-500 to-red-600",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-2xl p-6 text-center bg-gradient-to-br ${stat.color} text-white shadow-lg font-semibold`}
                >
                  <h3 className="text-lg">{stat.label}</h3>
                  <p className="text-5xl font-extrabold">{stat.value}</p>
                </motion.div>
              ))}
            </>
          ) : (
            <p className="col-span-4 text-center text-red-400">Aucune donnée disponible.</p>
          )}
        </div>

        {/* 🧍 Derniers médecins & patients */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-gray-100/70 to-gray-200/20 dark:from-gray-800/60 dark:to-gray-700/40 border border-gray-400/20 backdrop-blur-xl shadow-xl"
            >
              <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                🩺 Derniers Médecins
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-200 text-sm">
                {stats.derniers_medecins.map((m) => (
                  <li key={m.id}>
                    <b>
                      {m.nom} {m.prenom}
                    </b>{" "}
                    — {m.specialite || "Non spécifiée"}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-gray-100/70 to-gray-200/20 dark:from-gray-800/60 dark:to-gray-700/40 border border-gray-400/20 backdrop-blur-xl shadow-xl"
            >
              <h4 className="text-2xl font-semibold text-teal-600 dark:text-teal-300 mb-4">
                👨‍⚕️ Derniers Patients
              </h4>
              <ul className="space-y-3 text-gray-700 dark:text-gray-200 text-sm">
                {stats.derniers_patients.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between bg-white/20 dark:bg-black/20 px-4 py-2 rounded-lg hover:bg-gray-300/30 dark:hover:bg-gray-700/40 transition-all"
                  >
                    <div>
                      <b>
                        {p.nom} {p.prenom}
                      </b>{" "}
                      — {p.email}
                    </div>
                    <button
                      onClick={() => handleAnalysePatient(p.id)}
                      disabled={analyzing === p.id}
                      aria-label="Lancer l’analyse IA du patient"
                      className="flex items-center gap-2 px-3 py-1 text-xs bg-gradient-to-r from-indigo-500 to-cyan-500 
                                 rounded-full text-white font-semibold shadow hover:shadow-lg transition disabled:opacity-50"
                    >
                      {analyzing === p.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Analyse...
                        </>
                      ) : (
                        <>
                          <ActivitySquare size={14} /> Analyser
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}

        {/* 💬 Chat IA */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Dialogue Cognitif Aetheris
          </h2>
          <AetherisChat onLangueDetected={setLangue} />
        </div>

        {/* 👁 Signature */}
        <div className="text-center mt-16 text-indigo-400">
          <h3 className="text-2xl font-bold animate-pulse">💠 Aetheris — Cœur du savoir médical</h3>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            Système de conscience médicale interconnectée avec le vivant.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Aetheris;
