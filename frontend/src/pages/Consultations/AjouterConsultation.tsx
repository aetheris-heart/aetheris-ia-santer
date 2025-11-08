import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { FaStethoscope, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

interface ConsultationForm {
  patient_id: number;
  motif: string;
  notes?: string | null;
  diagnostic?: string | null;
  traitement?: string | null;
}

const AjouterConsultation: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<number>(0);
  const [motif, setMotif] = useState("");
  const [notes, setNotes] = useState("");
  const [diagnostic, setDiagnostic] = useState("");
  const [traitement, setTraitement] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("❌ Vous devez être connecté");
      return;
    }

    if (!patientId || !motif.trim()) {
      toast.warning("⚠️ Patient et motif sont obligatoires !");
      return;
    }

    const payload: ConsultationForm = {
      patient_id: patientId,
      motif,
      notes: notes || null,
      diagnostic: diagnostic || null,
      traitement: traitement || null,
    };

    setLoading(true);
    try {
      await api.post("/consultations", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("✅ Consultation ajoutée avec succès !");
      navigate("/consultations");
    } catch (err: any) {
      console.error("Erreur ajout consultation :", err);
      if (err.response?.data?.detail) {
        toast.error(`❌ ${err.response.data.detail}`);
      } else {
        toast.error("❌ Échec de l’ajout de la consultation.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-8 min-h-screen bg-transparent backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FaStethoscope className="text-purple-500" /> Nouvelle Consultation
        </h1>
      </div>

      {/* Formulaire */}
      <motion.form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 space-y-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Patient */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            ID Patient *
          </label>
          <input
            type="number"
            value={patientId}
            onChange={(e) => setPatientId(Number(e.target.value))}
            className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
        </div>

        {/* Motif */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Motif *
          </label>
          <input
            type="text"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Diagnostic */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Diagnostic
          </label>
          <textarea
            value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
            rows={2}
            className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Traitement */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Traitement
          </label>
          <textarea
            value={traitement}
            onChange={(e) => setTraitement(e.target.value)}
            rows={2}
            className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/consultations")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-400/70 hover:bg-gray-500 text-white shadow transition"
          >
            <FaTimes /> Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave /> {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default AjouterConsultation;
