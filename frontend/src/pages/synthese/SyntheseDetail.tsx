import React, { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { FileDown, ArrowRight } from "lucide-react";

interface RecommandationIA {
  texte: string;
  urgence?: string;
}

interface SyntheseIA {
  id: number;
  resume: string;
  score_global?: number;
  niveau_gravite?: string;
  alertes_critiques?: string[] | string;
  anomalies_detectees?: string[] | string;
  recommandations_ia?: RecommandationIA[];
  created_at: string;
}

const SyntheseDetail: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();

  const [synthese, setSynthese] = useState<SyntheseIA | null>(null);
  const [evolution, setEvolution] = useState<{ name: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Charger la synthèse IA + évolution
  useEffect(() => {
    if (!token || !patientId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [synthRes, evoRes] = await Promise.all([
          api.get(`/synthese-ia/${patientId}/latest`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/synthese-ia/${patientId}/analyse-evolution`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSynthese(synthRes.data);
        if (evoRes.data?.dernier_score) {
          setEvolution([
            { name: "Avant-dernier", score: evoRes.data.dernier_score - evoRes.data.variation },
            { name: "Dernier", score: evoRes.data.dernier_score },
          ]);
        }
      } catch (err: any) {
        console.error("❌ Erreur chargement synthèse :", err);
        setError(
          err.response?.status === 404
            ? "Aucune synthèse IA enregistrée pour ce patient."
            : "Erreur lors du chargement de la synthèse."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, patientId]);

  const handleExportPDF = async () => {
    if (!patientId) return;
    try {
      const res = await api.get(`/pdf/synthese/${patientId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Synthese_Aetheris_Patient_${patientId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Erreur export PDF :", err);
      alert("Erreur lors de la génération du PDF de synthèse IA.");
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-400">⏳ Chargement de la synthèse IA...</div>;

  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

  if (!synthese)
    return (
      <div className="p-6 text-center text-gray-400">
        Aucune synthèse IA disponible pour ce patient.
      </div>
    );

  const score = (synthese.score_global ?? 0) * 100;
  const couleurScore =
    score > 70 ? "text-red-400" : score > 40 ? "text-yellow-300" : "text-green-400";
  const graviteCouleur =
    synthese.niveau_gravite === "rouge"
      ? "text-red-400"
      : synthese.niveau_gravite === "orange"
        ? "text-orange-300"
        : synthese.niveau_gravite === "jaune"
          ? "text-yellow-300"
          : "text-green-300";

  const alertes =
    typeof synthese.alertes_critiques === "string"
      ? [synthese.alertes_critiques]
      : synthese.alertes_critiques || [];

  const anomalies =
    typeof synthese.anomalies_detectees === "string"
      ? [synthese.anomalies_detectees]
      : synthese.anomalies_detectees || [];

  return (
    <div className="p-8 min-h-screen text-white space-y-8 bg-transparent backdrop-blur-xl">
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="px-6 py-2 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg hover:scale-105 transition"
      >
        ← Retour
      </button>

      {/* En-tête */}
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
        Synthèse IA – Patient #{patientId}
      </h1>

      {/* Résumé principal */}
      <motion.div className="p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg">
        <p className="text-xl font-semibold">
          Score IA : <span className={`${couleurScore}`}>{score.toFixed(1)}%</span>
        </p>
        <p className="italic text-gray-300 mt-1">
          “{synthese.resume || "Aucun résumé disponible"}”
        </p>
        <p className="text-sm mt-2 text-gray-400">
          Niveau de gravité :{" "}
          <span className={graviteCouleur}>{synthese.niveau_gravite ?? "N/A"}</span>
        </p>
      </motion.div>

      {/* Graphique évolution */}
      <motion.div className="p-6 rounded-2xl bg-white/10 border border-white/20 shadow-lg">
        <h2 className="text-lg font-bold text-teal-300 mb-4">📈 Évolution du score IA</h2>
        {evolution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#00ffe7"
                strokeWidth={2}
                name="Score IA"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 italic">Pas encore assez de données pour une évolution.</p>
        )}
      </motion.div>

      {/* Alertes / Anomalies */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl backdrop-blur-lg bg-red-500/10 border border-red-400/30 shadow-lg">
          <h2 className="text-lg font-bold text-red-400 mb-3">🔴 Alertes critiques</h2>
          {alertes.length > 0 ? (
            <ul className="list-disc ml-6 space-y-1 text-gray-200">
              {alertes.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">Aucune alerte détectée.</p>
          )}
        </div>
        <div className="p-5 rounded-2xl backdrop-blur-lg bg-yellow-500/10 border border-yellow-400/30 shadow-lg">
          <h2 className="text-lg font-bold text-yellow-400 mb-3">🟡 Anomalies détectées</h2>
          {anomalies.length > 0 ? (
            <ul className="list-disc ml-6 space-y-1 text-gray-200">
              {anomalies.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">Aucune anomalie détectée.</p>
          )}
        </div>
      </motion.div>

      {/* Recommandations IA */}
      <motion.div className="p-5 rounded-2xl backdrop-blur-lg bg-green-500/10 border border-green-400/30 shadow-lg">
        <h2 className="text-lg font-bold text-green-400 mb-3">🧠 Recommandations IA</h2>
        {Array.isArray(synthese.recommandations_ia) && synthese.recommandations_ia.length > 0 ? (
          <ul className="list-disc ml-6 space-y-1 text-gray-200">
            {synthese.recommandations_ia.map((r, i) => (
              <li key={i}>
                <span className="text-teal-300">[{r.urgence ?? "Standard"}]</span> {r.texte}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Aucune recommandation disponible.</p>
        )}
      </motion.div>

      {/* Radar synthétique */}
      <motion.div className="p-6 rounded-2xl bg-white/10 border border-white/20 shadow-lg">
        <h2 className="text-lg font-bold text-indigo-300 mb-4">🧬 Répartition fonctionnelle</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart
            data={[
              { fonction: "Cardiaque", score: 35 },
              { fonction: "Pulmonaire", score: 25 },
              { fonction: "Rénale", score: 15 },
              { fonction: "Digestive", score: 10 },
              { fonction: "Métabolique", score: 8 },
              { fonction: "Neurologique", score: 7 },
            ]}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="fonction" stroke="#ccc" />
            <PolarRadiusAxis />
            <Radar name="Score" dataKey="score" stroke="#00ffe7" fill="#00ffe7" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Export PDF + Navigation */}
      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg hover:scale-105 transition"
        >
          <FileDown className="w-5 h-5" />
          Exporter PDF
        </button>
        <button
          onClick={() => navigate(`/dossiers/${patientId}`)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 via-green-500 to-emerald-600 text-white shadow-lg hover:scale-105 transition"
        >
          <ArrowRight className="w-5 h-5" />
          Dossier Patient
        </button>
      </div>
    </div>
  );
};

export default SyntheseDetail;
