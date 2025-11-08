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
  "Scanner cérébral",
  "Scanner thoracique",
  "IRM cérébrale",
  "IRM cardiaque",
  "Echographie abdominale",
  "Echographie obstétricale",
  "Scintigraphie osseuse",
  "TEP-scan",
  "Angiographie",
  "Autre",
];

const AjouterRadiologie: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<number>(0);
  const [typeExamen, setTypeExamen] = useState("");
  const [fichierUrl, setFichierUrl] = useState("");
  const [rapport, setRapport] = useState("");
  const [effectuePar, setEffectuePar] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧠 Envoi du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("🔒 Authentification requise pour enregistrer un examen.");
      return;
    }
    if (!patientId || !typeExamen) {
      toast.warning("⚠️ Le patient et le type d’examen sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        "/radiologie/",
        {
          patient_id: patientId,
          type_examen: typeExamen,
          fichier_url: fichierUrl || null,
          rapport: rapport || null,
          effectue_par: effectuePar || "Dr Aetheris",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Examen radiologique ajouté et analysé par Aetheris IA !");
      navigate(`/radiologie/${res.data.id}`);
    } catch (err) {
      console.error("❌ Erreur ajout radiologie :", err);
      toast.error("Erreur lors de l’ajout de l’examen radiologique.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🧭 Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
      >
        <FaArrowLeft /> Retour
      </button>

      <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <FaXRay className="text-blue-500" /> Nouvel Examen Radiologique
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ID Patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              🧑 Identifiant du patient *
            </label>
            <input
              type="number"
              value={patientId}
              onChange={(e) => setPatientId(Number(e.target.value))}
              required
              placeholder="Ex: 1"
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/70 dark:bg-gray-800/60 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Type d’examen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type d’examen *
            </label>
            <select
              value={typeExamen}
              onChange={(e) => setTypeExamen(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/70 dark:bg-gray-800/60 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choisir un type d’examen --</option>
              {examensDisponibles.map((exam, idx) => (
                <option key={idx} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>

          {/* URL du fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL du fichier (image / PDF / DICOM)
            </label>
            <input
              type="text"
              value={fichierUrl}
              onChange={(e) => setFichierUrl(e.target.value)}
              placeholder="/assets/radiologie/nom_du_fichier.jpg"
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/70 dark:bg-gray-800/60 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Rapport initial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rapport initial (optionnel)
            </label>
            <textarea
              value={rapport}
              onChange={(e) => setRapport(e.target.value)}
              rows={3}
              placeholder="Notes ou observations cliniques..."
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/70 dark:bg-gray-800/60 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Nom du radiologue */}
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
              bg-white/70 dark:bg-gray-800/60 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Bouton d’envoi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
            bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg 
            hover:scale-105 transition disabled:opacity-60"
          >
            <FaSave />
            {loading ? "Analyse IA en cours..." : "Enregistrer l’examen"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AjouterRadiologie;
