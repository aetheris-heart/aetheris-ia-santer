import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import type { AnalyseIA } from "@/types/analyseIA";
import { Card, CardContent } from "@/components/uui";
import { FaArrowLeft, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

const AnalyseIAHistory: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState<AnalyseIA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get<AnalyseIA[]>(`/analyse-ia/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalyses(res.data);
      } catch (e) {
        console.error("Erreur Historique Analyses IA:", e);
        toast.error("Impossible de charger l'historique des analyses.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId && token) {
      fetchHistory();
    }
  }, [patientId, token]);

  if (loading)
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">⏳ Chargement de l'historique...</div>
    );

  if (!analyses.length)
    return <div className="p-6 text-red-600 dark:text-red-400">❌ Aucune analyse trouvée.</div>;

  return (
    <div className="p-6 space-y-6 bg-transparent backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-white/40 dark:bg-gray-800/60 text-gray-900 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/60 dark:hover:bg-gray-700 backdrop-blur-sm shadow-md"
        >
          <FaArrowLeft /> Retour
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Historique des Analyses IA
        </h2>
      </div>

      {/* Liste des analyses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyses.map((analyse) => (
          <Card
            key={analyse.id}
            onClick={() => navigate(`/analyse-ia/detail/${analyse.id}`)}
            className="cursor-pointer bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-lg hover:scale-[1.02] transition"
          >
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <FaClock /> {new Date(analyse.created_at).toLocaleString()}
                </span>
                {analyse.type_analyse && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    {analyse.type_analyse}
                  </span>
                )}
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                📝 {analyse.description}
              </p>
              {analyse.score !== undefined && analyse.score !== null && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  📊 Score IA : {analyse.score}
                </p>
              )}
              {analyse.observations && (
                <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                  🔍 {analyse.observations}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnalyseIAHistory;
