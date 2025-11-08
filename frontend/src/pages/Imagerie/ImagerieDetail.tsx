import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaXRay } from "react-icons/fa";

interface Imagerie {
  id: number;
  patient_id: number;
  type_examen: string;
  autre_examen?: string;
  fichier_url?: string;
  description?: string;
  effectue_par?: string;
  date_examen: string;
}

const ImagerieDetail: React.FC = () => {
  const { id } = useParams();
  const { token } = useUser();
  const navigate = useNavigate();
  const [imagerie, setImagerie] = useState<Imagerie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    api
      .get<Imagerie>(`/imageries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setImagerie(res.data))
      .catch(() => toast.error("❌ Impossible de charger l’imagerie"))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <p className="p-8">⏳ Chargement...</p>;
  if (!imagerie) return <p className="p-8 text-red-500">❌ Imagerie introuvable</p>;

  return (
    <motion.div
      className="p-8 min-h-screen bg-transparent backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow hover:scale-105 transition"
      >
        <FaArrowLeft /> Retour
      </button>

      <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <FaXRay /> Détails Imagerie #{imagerie.id}
        </h1>

        <div className="space-y-4 text-gray-800 dark:text-gray-200">
          <p>
            <strong>🧑 Patient :</strong> {imagerie.patient_id}
          </p>
          <p>
            <strong>📋 Examen :</strong> {imagerie.autre_examen || imagerie.type_examen}
          </p>
          <p>
            <strong>👨‍⚕️ Effectué par :</strong> {imagerie.effectue_par || "—"}
          </p>
          <p>
            <strong>🕒 Date :</strong> {new Date(imagerie.date_examen).toLocaleString()}
          </p>
          {imagerie.description && (
            <p>
              <strong>📝 Description :</strong> {imagerie.description}
            </p>
          )}

          {imagerie.fichier_url && (
            <div className="mt-4">
              <p className="font-semibold">📂 Fichier associé :</p>
              {imagerie.fichier_url.endsWith(".pdf") ? (
                <a
                  href={imagerie.fichier_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Ouvrir le rapport PDF
                </a>
              ) : (
                <img
                  src={imagerie.fichier_url}
                  alt="Examen médical"
                  className="mt-2 rounded-lg shadow-lg max-h-96"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ImagerieDetail;
