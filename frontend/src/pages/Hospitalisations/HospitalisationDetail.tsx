import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaBed, FaClipboardList, FaEdit, FaCalendarCheck } from "react-icons/fa";

interface Hospitalisation {
  id: number;
  patient_id: number;
  service: string;
  chambre?: string;
  lit?: string;
  motif?: string;
  observations?: string;
  statut: string;
  date_entree: string;
  date_sortie?: string | null;
  patient_nom?: string;
  patient_prenom?: string;
  medecin_nom?: string;
}

const HospitalisationDetail: React.FC = () => {
  const { hospId } = useParams<{ hospId: string }>();
  const { token } = useUser();
  const navigate = useNavigate();
  const [hospitalisation, setHospitalisation] = useState<Hospitalisation | null>(null);

  useEffect(() => {
    if (!token || !hospId) return;
    api
      .get<Hospitalisation>(`/hospitalisations/${hospId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHospitalisation(res.data))
      .catch(() => toast.error("❌ Impossible de charger l’hospitalisation"));
  }, [hospId, token]);

  const cloturerHospitalisation = async () => {
    if (!hospitalisation) return;
    if (!window.confirm("✅ Clôturer cette hospitalisation ?")) return;

    try {
      const res = await api.put<Hospitalisation>(
        `/hospitalisations/${hospitalisation.id}`,
        { statut: "terminé", date_sortie: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHospitalisation(res.data);
      toast.success("🏥 Hospitalisation clôturée");
    } catch {
      toast.error("❌ Échec de la clôture");
    }
  };

  if (!hospitalisation) return <p className="p-6 text-gray-500">⏳ Chargement...</p>;

  return (
    <motion.div
      className="p-8 min-h-screen bg-transparent backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow hover:scale-105 transition"
      >
        <FaArrowLeft /> Retour
      </button>

      {/* Carte détail */}
      <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <FaBed /> Hospitalisation #{hospitalisation.id}
        </h1>

        <div className="space-y-3 text-gray-800 dark:text-gray-200">
          <p>
            <strong>👤 Patient :</strong> {hospitalisation.patient_prenom}{" "}
            {hospitalisation.patient_nom}
          </p>
          <p>
            <strong>🏥 Service :</strong> {hospitalisation.service}
          </p>
          <p>
            <strong>🛏️ Chambre/Lit :</strong> {hospitalisation.chambre || "—"} /{" "}
            {hospitalisation.lit || "—"}
          </p>
          <p>
            <strong>📋 Motif :</strong> {hospitalisation.motif || "—"}
          </p>
          <p>
            <strong>📝 Observations :</strong> {hospitalisation.observations || "—"}
          </p>
          <p>
            <strong>⚡ Statut :</strong>{" "}
            <span
              className={`px-2 py-1 rounded ${
                hospitalisation.statut === "en cours"
                  ? "bg-yellow-500 text-white"
                  : hospitalisation.statut === "terminé"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
              }`}
            >
              {hospitalisation.statut}
            </span>
          </p>
          <p>
            <strong>📅 Date entrée :</strong>{" "}
            {new Date(hospitalisation.date_entree).toLocaleString()}
          </p>
          {hospitalisation.date_sortie && (
            <p>
              <strong>✅ Date sortie :</strong>{" "}
              {new Date(hospitalisation.date_sortie).toLocaleString()}
            </p>
          )}
        </div>

        {/* Boutons actions */}
        <div className="flex gap-4 mt-6">
          {hospitalisation.statut !== "terminé" && (
            <button
              onClick={cloturerHospitalisation}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
            >
              <FaCalendarCheck /> Clôturer
            </button>
          )}
          <button
            onClick={() => navigate(`/hospitalisations/modifier/${hospitalisation.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow transition"
          >
            <FaEdit /> Modifier
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HospitalisationDetail;
