import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const AjouterImagerie: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  // Champs du formulaire
  const [patientId, setPatientId] = useState<number>(0);
  const [typeExamen, setTypeExamen] = useState("");
  const [autreExamen, setAutreExamen] = useState("");
  const [fichierUrl, setFichierUrl] = useState("");
  const [description, setDescription] = useState("");
  const [effectuePar, setEffectuePar] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("🔒 Authentification requise");
      return;
    }
    if (!patientId || !typeExamen) {
      toast.warning("⚠️ Patient et type d’examen obligatoires !");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        "/imageries/",
        {
          patient_id: patientId,
          type_examen: typeExamen,
          autre_examen: typeExamen === "Autre" ? autreExamen : null,
          fichier_url: fichierUrl || null,
          description: description || null,
          effectue_par: effectuePar || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Imagerie ajoutée avec succès !");
      navigate(`/imageries/${res.data.id}`);
    } catch (err: any) {
      console.error("❌ Erreur ajout imagerie :", err);
      toast.error("❌ Impossible d’ajouter l’imagerie");
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
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow hover:scale-105 transition"
      >
        <FaArrowLeft /> Retour
      </button>

      <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <FaXRay /> Nouvel Examen d’Imagerie
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              🧑 ID Patient *
            </label>
            <input
              type="number"
              value={patientId}
              onChange={(e) => setPatientId(Number(e.target.value))}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Type Examen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type d’examen *
            </label>
            <select
              value={typeExamen}
              onChange={(e) => setTypeExamen(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">-- Choisir --</option>
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
                Préciser l’examen
              </label>
              <input
                type="text"
                value={autreExamen}
                onChange={(e) => setAutreExamen(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          )}

          {/* URL Fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL du fichier (image/PDF)
            </label>
            <input
              type="text"
              value={fichierUrl}
              onChange={(e) => setFichierUrl(e.target.value)}
              placeholder="http://..."
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
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
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
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
              placeholder="Nom du radiologue"
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
            bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AjouterImagerie;
