import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEdit, FaHeartbeat, FaRobot } from "react-icons/fa";

interface BlocOperatoire {
  id: number;
  patient_id: number;
  type_intervention: string;
  chirurgien: string;
  assistant1?: string;
  assistant2?: string;
  assistant3?: string;
  assistant4?: string;
  date_intervention?: string | null;
  duree?: string;
  compte_rendu?: string;
  statut: string;
}

const BlocOperatoireDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [bloc, setBloc] = useState<BlocOperatoire | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    const ctrl = new AbortController();

    const fetchBloc = async () => {
      setLoading(true);
      const ctrl = new AbortController(); // ✅ créer le contrôleur ici
      try {
        const res = await api.get<BlocOperatoire>(`/bloc-operatoire/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal, // ✅ pas besoin de "as any"
        });

        setBloc(res.data);
      } catch (error: any) {
        if (axios.isCancel(error)) {
          console.warn("⏹️ Requête annulée par le composant");
        } else {
          console.error("❌ Erreur lors du chargement du bloc opératoire :", error);
          toast.error("Erreur lors du chargement du bloc opératoire");
        }
      } finally {
        setLoading(false);
      }

      // ✅ retourne le contrôleur pour annuler proprement lors du démontage
      return () => ctrl.abort();
    };

    fetchBloc();
    return () => ctrl.abort();
  }, [id, token, navigate]);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 dark:text-gray-300 animate-pulse">
        ⏳ Chargement des données chirurgicales...
      </p>
    );

  if (!bloc) return null;

  const assistants =
    [bloc.assistant1, bloc.assistant2, bloc.assistant3, bloc.assistant4]
      .filter(Boolean)
      .join(", ") || "—";

  // 🎨 Couleur de statut dynamique
  const statutColor =
    bloc.statut === "Terminée"
      ? "bg-green-100 text-green-700"
      : bloc.statut === "En cours"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-700";

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🔙 Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
      >
        <FaArrowLeft /> Retour
      </button>

      {/* 🏥 Carte principale */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/40 max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow">
            Bloc opératoire #{bloc.id}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/bloc-operatoire/modifier/${bloc.id}`)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow hover:scale-105 transition flex items-center gap-2"
            >
              <FaEdit /> Modifier
            </button>
            <button
              onClick={() => navigate(`/bloc-operatoire/analyse/${bloc.id}`)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:scale-105 transition flex items-center gap-2"
            >
              <FaRobot /> Analyse IA
            </button>
          </div>
        </div>

        {/* 🩺 Détails médicaux */}
        <div className="grid md:grid-cols-2 gap-6 text-gray-900 dark:text-gray-100">
          <div>
            <p className="font-semibold text-gray-500">🧍 Patient</p>
            <p className="text-lg font-bold">{bloc.patient_id}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">💉 Intervention</p>
            <p>{bloc.type_intervention}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">👨‍⚕️ Chirurgien</p>
            <p>{bloc.chirurgien}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">👥 Assistants</p>
            <p>{assistants}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">📅 Date</p>
            <p>
              {bloc.date_intervention
                ? new Date(bloc.date_intervention).toLocaleString("fr-FR")
                : "—"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">⏱ Durée</p>
            <p>{bloc.duree || "—"}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">🩸 Statut</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${statutColor}`}
            >
              {bloc.statut}
            </span>
          </div>
        </div>

        {/* 🧾 Compte rendu */}
        <div className="mt-6">
          <p className="font-semibold text-gray-500 mb-1">🧾 Compte rendu</p>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-gray-800 dark:text-gray-200 shadow-inner border border-gray-200 dark:border-gray-700">
            {bloc.compte_rendu || "Aucun compte rendu disponible."}
          </div>
        </div>

        {/* ❤️ Signature visuelle */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <FaHeartbeat className="inline text-red-500 mr-2 animate-pulse" />
          <span>Analyse médicale assistée par Aetheris IA</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlocOperatoireDetail;
