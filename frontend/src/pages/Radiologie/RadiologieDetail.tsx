import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEdit, FaTrash, FaXRay, FaRobot, FaBrain } from "react-icons/fa";

interface Radiologie {
  id: number;
  patient_id: number;
  type_examen: string;
  fichier_url?: string;
  rapport?: string;
  analyse_ia?: string;
  effectue_par?: string;
  niveau_risque?: string;
  date_examen: string;
}

interface AnalyseIA {
  resume: string;
  niveau_risque: string;
  anomalies_detectees: string[];
  confiance: number;
  recommandations: string[];
  analyse_par: string;
  horodatage: string;
}

const RadiologieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [radiologie, setRadiologie] = useState<Radiologie | null>(null);
  const [analyseIA, setAnalyseIA] = useState<AnalyseIA | null>(null);
  const [loading, setLoading] = useState(true);

  // 📥 Charger les détails
  useEffect(() => {
    if (!token || !id) return;

    api
      .get<Radiologie>(`/radiologie/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRadiologie(res.data);
        if (res.data.analyse_ia) {
          try {
            setAnalyseIA(JSON.parse(res.data.analyse_ia));
          } catch {
            console.warn("Erreur parsing analyse IA");
          }
        }
      })
      .catch(() => toast.error("❌ Impossible de charger l’examen radiologique"))
      .finally(() => setLoading(false));
  }, [id, token]);

  // 🗑️ Supprimer examen
  const handleDelete = async () => {
    if (!window.confirm("❌ Supprimer définitivement cet examen ?")) return;
    try {
      await api.delete(`/radiologie/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Examen radiologique supprimé !");
      navigate("/radiologie");
    } catch {
      toast.error("❌ Erreur lors de la suppression");
    }
  };

  if (loading) return <p className="text-center text-gray-500 p-8">⏳ Chargement...</p>;
  if (!radiologie) return <p className="text-center text-red-500 p-8">❌ Examen introuvable.</p>;

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* === Header === */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg shadow hover:scale-105 transition"
        >
          <FaArrowLeft /> Retour
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/radiologie/modifier/${radiologie.id}`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
          >
            <FaEdit /> Modifier
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
          >
            <FaTrash /> Supprimer
          </button>
        </div>
      </div>

      {/* === Détails de l’examen === */}
      <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2 mb-6">
          <FaXRay className="text-blue-500" /> Détail de l’examen radiologique
        </h1>

        {/* Image d’examen */}
        {radiologie.fichier_url && (
          <div className="flex justify-center mb-8">
            <img
              src={radiologie.fichier_url}
              alt="Radiographie"
              className="rounded-xl shadow-xl max-h-[400px] object-contain border border-gray-300 dark:border-gray-700"
            />
          </div>
        )}

        {/* Infos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 dark:text-gray-200">
          <p>
            <span className="font-semibold">🧑 Patient ID :</span> {radiologie.patient_id}
          </p>
          <p>
            <span className="font-semibold">📅 Date :</span>{" "}
            {new Date(radiologie.date_examen).toLocaleString("fr-FR")}
          </p>
          <p>
            <span className="font-semibold">📋 Type d’examen :</span> {radiologie.type_examen}
          </p>
          <p>
            <span className="font-semibold">👨‍⚕️ Effectué par :</span>{" "}
            {radiologie.effectue_par || "Non spécifié"}
          </p>
          {radiologie.niveau_risque && (
            <p>
              <span className="font-semibold">⚠️ Niveau de risque :</span>{" "}
              <span
                className={`px-2 py-1 rounded-md font-semibold ${
                  radiologie.niveau_risque === "Élevé"
                    ? "bg-red-600/30 text-red-600"
                    : radiologie.niveau_risque === "Modéré"
                      ? "bg-yellow-500/30 text-yellow-600"
                      : "bg-green-500/30 text-green-600"
                }`}
              >
                {radiologie.niveau_risque}
              </span>
            </p>
          )}
        </div>

        {/* Rapport du médecin */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            📝 Rapport du médecin
          </h2>
          <p className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg shadow text-gray-700 dark:text-gray-300">
            {radiologie.rapport || "Aucun rapport disponible."}
          </p>
        </div>

        {/* === Analyse IA === */}
        {analyseIA && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-purple-600 flex items-center gap-2 mb-3">
              <FaRobot /> Analyse IA Aetheris
            </h2>

            <div className="bg-purple-100 dark:bg-purple-900/40 p-5 rounded-xl shadow-lg space-y-3 text-gray-800 dark:text-gray-200">
              <p>
                <strong>Résumé :</strong> {analyseIA.resume}
              </p>

              <p>
                <strong>Anomalies détectées :</strong>{" "}
                {analyseIA.anomalies_detectees?.join(", ") || "Aucune"}
              </p>

              <p>
                <strong>Niveau de risque :</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-md font-semibold ${
                    analyseIA.niveau_risque === "Élevé"
                      ? "bg-red-600/30 text-red-600"
                      : analyseIA.niveau_risque === "Modéré"
                        ? "bg-yellow-500/30 text-yellow-600"
                        : "bg-green-500/30 text-green-600"
                  }`}
                >
                  {analyseIA.niveau_risque}
                </span>
              </p>

              <p>
                <strong>Confiance IA :</strong> {(analyseIA.confiance * 100).toFixed(0)}%
              </p>

              {analyseIA.recommandations && (
                <div>
                  <strong>Recommandations :</strong>
                  <ul className="list-disc ml-6 mt-1">
                    {analyseIA.recommandations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs opacity-70 italic">
                Analyse effectuée par {analyseIA.analyse_par} — {analyseIA.horodatage}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RadiologieDetail;
