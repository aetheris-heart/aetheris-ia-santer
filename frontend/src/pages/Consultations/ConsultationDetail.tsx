import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { FaArrowLeft, FaNotesMedical, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";

interface Consultation {
  id: number;
  patient_nom?: string;
  patient_prenom?: string;
  medecin_nom?: string;
  motif: string;
  diagnostic: string;
  notes?: string;
  traitement?: string;
  date_consultation: string;
}

const ConsultationDetail: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const { token } = useUser();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !consultationId) return;
    setLoading(true);
    api
      .get<Consultation>(`/consultations/${consultationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setConsultation(res.data))
      .catch((err) => {
        console.error("Erreur chargement consultation :", err);
        toast.error("❌ Impossible de charger la consultation.");
      })
      .finally(() => setLoading(false));
  }, [consultationId, token]);

  if (loading) {
    return <p className="p-6 text-gray-500">⏳ Chargement de la consultation...</p>;
  }

  if (!consultation) {
    return <p className="p-6 text-red-500">❌ Consultation introuvable.</p>;
  }

  return (
    <motion.div
      className="p-8 min-h-screen bg-transparent backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Boutons de navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow hover:scale-105 transition"
        >
          <FaArrowLeft /> Retour
        </button>
        <button
          onClick={() => navigate(`/consultations/modifier/${consultation.id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg shadow hover:scale-105 transition"
        >
          <FaEdit /> Modifier
        </button>
      </div>

      {/* Détails consultation */}
      <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <FaNotesMedical /> Consultation #{consultation.id}
        </h1>
        <p>
          <strong>Patient :</strong> {consultation.patient_prenom} {consultation.patient_nom}
        </p>
        <p>
          <strong>Médecin :</strong> {consultation.medecin_nom || "—"}
        </p>
        <p>
          <strong>Motif :</strong> {consultation.motif}
        </p>
        <p>
          <strong>Diagnostic :</strong> {consultation.diagnostic || "—"}
        </p>
        <p>
          <strong>Notes :</strong> {consultation.notes || "—"}
        </p>
        <p>
          <strong>Traitement :</strong> {consultation.traitement || "—"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          📅{" "}
          {new Date(consultation.date_consultation).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default ConsultationDetail;
