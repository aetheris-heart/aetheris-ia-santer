import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Save } from "lucide-react";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";

const VisualIACreate: React.FC = () => {
  const { token } = useUser();
  const [form, setForm] = useState({ patient_id: "", domaine: "", file: null as File | null });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) return toast.error("Sélectionnez une image à analyser !");
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("patient_id", form.patient_id);
      formData.append("domaine", form.domaine);
      formData.append("file", form.file);
      await api.post("/modules-ia/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Analyse IA soumise avec succès !");
      setForm({ patient_id: "", domaine: "", file: null });
    } catch {
      toast.error("❌ Erreur lors de l’envoi de l’analyse IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="backdrop-blur-xl bg-white/10 border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-cyan-400 flex items-center gap-2">
          <UploadCloud className="w-6 h-6" /> Nouvelle Analyse IA
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="ID Patient"
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-cyan-500 outline-none"
            required
          />
          <label
  htmlFor="domaine"
  className="block text-sm font-medium mb-1 text-gray-200"
>
  Domaine d’analyse
</label>

<select
  id="domaine" // ✅ identifiant lié au label
  value={form.domaine}
  onChange={(e) => setForm({ ...form, domaine: e.target.value })}
  aria-label="Domaine d’analyse IA" // ✅ nom accessible additionnel
  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-cyan-500 outline-none text-white"
  required
>
  <option value="">Choisir un domaine</option>
  <option value="radiologie">Radiologie</option>
  <option value="neurologique">Neurologie</option>
  <option value="digestive">Digestive</option>
  <option value="cardiaque">Cardiaque</option>
  <option value="metabolique">Métabolique</option>
  <option value="renale">Rénale</option>
</select>

          <input
            type="file"
            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
            className="w-full p-2 rounded-lg bg-white/10 border border-white/20 file:bg-cyan-500 file:text-white file:border-0 file:px-3 file:py-1"
            accept="image/*"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg shadow flex items-center justify-center gap-2"
          >
            {loading ? (
              "Analyse en cours..."
            ) : (
              <>
                <Save className="w-5 h-5" /> Lancer l’analyse IA
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default VisualIACreate;
