import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSave, FaFileMedical, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

interface DossierMedicalCreate {
  patient_id: number;
  resume?: string;
  antecedents?: string;
  traitements?: string;
  allergies?: string;
  notes?: string;
}

const AjouterDossier: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useUser();

  const [formData, setFormData] = useState<DossierMedicalCreate>({
    patient_id: 0,
    resume: "",
    antecedents: "",
    traitements: "",
    allergies: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("🔒 Vous devez être connecté.");
      return;
    }

    if (!formData.patient_id) {
      toast.warning("⚠️ Le champ patient_id est obligatoire.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/dossiers", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Dossier créé avec succès !");
      navigate(`/dossiers/${res.data.id}`);
    } catch (err) {
      console.error("Erreur création dossier :", err);
      toast.error("❌ Impossible de créer le dossier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 
                    bg-transparent text-gray-900 dark:text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white/30 dark:bg-gray-800/40 
                   backdrop-blur-2xl rounded-3xl shadow-xl p-10 
                   border border-white/40"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2
            className="text-3xl font-extrabold flex items-center gap-2 
                         text-gray-900 dark:text-white"
          >
            <FaFileMedical /> Nouveau Dossier Médical
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white/40 dark:bg-gray-700/60 
                       text-gray-900 dark:text-white rounded-lg 
                       backdrop-blur-md hover:bg-white/60 
                       dark:hover:bg-gray-600 transition 
                       flex items-center gap-2 shadow"
          >
            <FaArrowLeft /> Retour
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient ID */}
          <div>
            <label htmlFor="patient_id" className={labelClass}>
              🧑‍⚕️ ID Patient
            </label>
            <input
              id="patient_id"
              name="patient_id"
              type="number"
              value={formData.patient_id}
              onChange={handleChange}
              className={glassInput}
              required
            />
          </div>

          {/* Résumé */}
          <div>
            <label htmlFor="resume" className={labelClass}>
              📝 Résumé
            </label>
            <textarea
              id="resume"
              name="resume"
              value={formData.resume}
              onChange={handleChange}
              className={glassInput}
              rows={3}
            />
          </div>

          {/* Antécédents */}
          <div>
            <label htmlFor="antecedents" className={labelClass}>
              ⚕️ Antécédents
            </label>
            <textarea
              id="antecedents"
              name="antecedents"
              value={formData.antecedents}
              onChange={handleChange}
              className={glassInput}
              rows={3}
            />
          </div>

          {/* Traitements */}
          <div>
            <label htmlFor="traitements" className={labelClass}>
              💊 Traitements
            </label>
            <textarea
              id="traitements"
              name="traitements"
              value={formData.traitements}
              onChange={handleChange}
              className={glassInput}
              rows={3}
            />
          </div>

          {/* Allergies */}
          <div>
            <label htmlFor="allergies" className={labelClass}>
              🚨 Allergies
            </label>
            <textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              className={glassInput}
              rows={3}
            />
          </div>

          {/* Notes internes */}
          <div>
            <label htmlFor="notes" className={labelClass}>
              📌 Notes internes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={glassInput}
              rows={3}
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600/80 hover:bg-indigo-700/90 
                         text-white rounded-xl shadow-lg flex items-center 
                         gap-2 transition backdrop-blur-md"
            >
              <FaSave /> {loading ? "⏳ Enregistrement..." : "✅ Enregistrer"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Styles Glass Inputs & Labels
const glassInput =
  "w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-lg border border-white/40 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 outline-none transition";

const labelClass = "block text-sm mb-1 font-semibold text-gray-800 dark:text-gray-200";

export default AjouterDossier;
