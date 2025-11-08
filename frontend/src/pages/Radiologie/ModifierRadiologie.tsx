import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaXRay } from "react-icons/fa";

const ModifierRadiologie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<number>(0);
  const [typeExamen, setTypeExamen] = useState("");
  const [fichierUrl, setFichierUrl] = useState("");
  const [rapport, setRapport] = useState("");
  const [effectuePar, setEffectuePar] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // 📥 Charger l’examen existant
  useEffect(() => {
    if (!id || !token) return;
    api
      .get(`/radiologie/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setPatientId(data.patient_id);
        setTypeExamen(data.type_examen);
        setFichierUrl(data.fichier_url || "");
        setRapport(data.rapport || "");
        setEffectuePar(data.effectue_par || "");
        setInitialLoaded(true);
      })
      .catch(() => toast.error("❌ Impossible de charger l’examen radiologique"));
  }, [id, token]);

  // ✅ Soumettre les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("🔒 Authentification requise");
      return;
    }

    if (!typeExamen) {
      toast.warning("⚠️ Le type d’examen est obligatoire");
      return;
    }

    setLoading(true);
    try {
      await api.put(
        `/radiologie/${id}`,
        {
          patient_id: patientId,
          type_examen: typeExamen,
          fichier_url: fichierUrl || null,
          rapport: rapport || null,
          effectue_par: effectuePar || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Examen radiologique mis à jour !");
      navigate(`/radiologie/${id}`);
    } catch (err: any) {
      console.error("❌ Erreur modification radiologie :", err);
      toast.error("❌ Échec de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* === Bouton retour === */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg shadow hover:scale-105 transition"
      >
        <FaArrowLeft /> Retour
      </button>

      {/* === Contenu principal === */}
      {!initialLoaded ? (
        <p className="text-center text-gray-500 mt-20">Chargement de l’examen...</p>
      ) : (
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-blue-700 dark:text-blue-400">
            <FaXRay className="text-blue-500" />
            Modifier l’examen radiologique
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 🧍 Patient ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🧑 Identifiant du patient
              </label>
              <input
                type="number"
                value={patientId}
                onChange={(e) => setPatientId(Number(e.target.value))}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/70 dark:bg-gray-800/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* 🧠 Type d’examen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type d’examen *
              </label>
              <input
                type="text"
                value={typeExamen}
                onChange={(e) => setTypeExamen(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/70 dark:bg-gray-800/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* 🖼️ URL du fichier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL du fichier (image, PDF, DICOM)
              </label>
              <input
                type="text"
                value={fichierUrl}
                onChange={(e) => setFichierUrl(e.target.value)}
                placeholder="/assets/radiologie/image_examen.jpg"
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/70 dark:bg-gray-800/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* 🩺 Rapport du médecin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rapport du médecin
              </label>
              <textarea
                value={rapport}
                onChange={(e) => setRapport(e.target.value)}
                rows={4}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/70 dark:bg-gray-800/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* 👨‍⚕️ Effectué par */}
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

            {/* === Bouton d’enregistrement === */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
              bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:scale-105 transition disabled:opacity-60"
            >
              <FaSave />
              {loading ? "Mise à jour en cours..." : "Enregistrer les modifications"}
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default ModifierRadiologie;
