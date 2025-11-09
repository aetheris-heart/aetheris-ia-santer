import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaXRay } from "react-icons/fa";

const examensDisponibles = [
  "Radiographie thoracique",
  "Radiographie osseuse",
  "Mammographie",
  "Scanner cérébral",
  "Scanner thoracique",
  "Scanner abdominal",
  "IRM cérébrale",
  "IRM cardiaque",
  "IRM musculo-squelettique",
  "Echographie abdominale",
  "Echographie obstétricale",
  "Echographie cardiaque",
  "Doppler vasculaire",
  "Scintigraphie osseuse",
  "TEP-scan",
  "Densitométrie osseuse",
  "Angiographie",
  "Autre",
];

const ModifierImagerie: React.FC = () => {
  const { id } = useParams();
  const { token } = useUser();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<number>(0);
  const [typeExamen, setTypeExamen] = useState("");
  const [autreExamen, setAutreExamen] = useState("");
  const [fichierUrl, setFichierUrl] = useState("");
  const [description, setDescription] = useState("");
  const [effectuePar, setEffectuePar] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    api
      .get(`/imageries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setPatientId(data.patient_id);
        setTypeExamen(data.type_examen);
        setAutreExamen(data.autre_examen || "");
        setFichierUrl(data.fichier_url || "");
        setDescription(data.description || "");
        setEffectuePar(data.effectue_par || "");
      })
      .catch(() => toast.error("❌ Impossible de charger l’imagerie"));
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      await api.put(
        `/imageries/${id}`,
        {
          type_examen: typeExamen,
          autre_examen: typeExamen === "Autre" ? autreExamen : null,
          fichier_url: fichierUrl || null,
          description: description || null,
          effectue_par: effectuePar || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Imagerie modifiée avec succès !");
      navigate(`/imageries/${id}`);
    } catch (err) {
      console.error("❌ Erreur modification imagerie :", err);
      toast.error("❌ Échec de la modification");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-yellow-500">
          <FaXRay /> Modifier Imagerie
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              🧑 ID Patient
            </label>
            <input
              type="number"
              value={patientId}
              readOnly
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60"
            />
          </div>

          {/* Type examen */}
<div>
  <label
    htmlFor="type_examen"
    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
  >
    Type d’examen
  </label>

  <select
    id="type_examen"
    name="type_examen"
    title="Type d’examen d’imagerie médicale"
    aria-label="Type d’examen d’imagerie médicale"
    value={typeExamen}
    onChange={(e) => setTypeExamen(e.target.value)}
    required
    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
    bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
  >
    {examensDisponibles.map((exam, idx) => (
      <option key={idx} value={exam}>
        {exam}
      </option>
    ))}
  </select>
</div>


          {/* Autre examen */}
          {typeExamen === "Autre" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Préciser
              </label>
              <input
                type="text"
                value={autreExamen}
                onChange={(e) => setAutreExamen(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60"
              />
            </div>
          )}

          {/* URL fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fichier
            </label>
            <input
              type="text"
              value={fichierUrl}
              onChange={(e) => setFichierUrl(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60"
            />
          </div>

          {/* Effectué par */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Effectué par
            </label>
            <input
              type="text"
              value={effectuePar}
              onChange={(e) => setEffectuePar(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ModifierImagerie;
