import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaNotesMedical } from "react-icons/fa";

interface ConsultationFormProps {
  mode: "create" | "edit";
  consultationId?: number | undefined;
}

interface ConsultationPayload {
  patient_id: number;
  motif: string;
  diagnostic?: string | null;
  notes?: string | null;
  traitement?: string | null;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ mode, consultationId }) => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ConsultationPayload>({
    patient_id: 0,
    motif: "",
    diagnostic: "",
    notes: "",
    traitement: "",
  });
  const [loading, setLoading] = useState(false);

  // Charger les données si en mode édition
  useEffect(() => {
    if (mode === "edit" && consultationId && token) {
      setLoading(true);
      api
        .get(`/consultations/${consultationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setFormData({
            patient_id: res.data.patient_id,
            motif: res.data.motif,
            diagnostic: res.data.diagnostic || "",
            notes: res.data.notes || "",
            traitement: res.data.traitement || "",
          });
        })
        .catch(() => toast.error("❌ Impossible de charger la consultation"))
        .finally(() => setLoading(false));
    }
  }, [mode, consultationId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "patient_id" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("🔒 Authentification requise");
      return;
    }

    if (!formData.patient_id || !formData.motif.trim()) {
      toast.warning("⚠️ Patient et motif sont obligatoires !");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        await api.post("/consultations", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Consultation ajoutée !");
      } else if (mode === "edit" && consultationId) {
        await api.put(`/consultations/${consultationId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✏️ Consultation mise à jour !");
      }

      navigate("/consultations");
    } catch (err: any) {
      console.error("❌ Erreur consultation :", err);
      toast.error(err.response?.data?.detail || "Erreur lors de l'opération");
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

      {/* Formulaire */}
      <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <FaNotesMedical /> {mode === "create" ? "Nouvelle Consultation" : "Modifier Consultation"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              🧑 Patient ID
            </label>
            <input
              type="number"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              required
              disabled={mode === "edit"} // ⚡ évite de changer le patient en édition
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Motif de consultation *
            </label>
            <input
              type="text"
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Diagnostic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Diagnostic
            </label>
            <textarea
              name="diagnostic"
              value={formData.diagnostic || ""}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes complémentaires
            </label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
              rows={2}
            />
          </div>

          {/* Traitement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Traitement proposé
            </label>
            <textarea
              name="traitement"
              value={formData.traitement || ""}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
              rows={2}
            />
          </div>

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
            bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Enregistrement..." : mode === "create" ? "Enregistrer" : "Mettre à jour"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ConsultationForm;
