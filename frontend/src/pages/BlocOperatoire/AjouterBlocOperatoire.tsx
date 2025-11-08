import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaUserMd } from "react-icons/fa";

const AjouterBlocOperatoire: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<number | "">("");
  const [typeIntervention, setTypeIntervention] = useState("");
  const [chirurgien, setChirurgien] = useState("");
  const [assistant1, setAssistant1] = useState("");
  const [assistant2, setAssistant2] = useState("");
  const [assistant3, setAssistant3] = useState("");
  const [assistant4, setAssistant4] = useState("");
  const [dateIntervention, setDateIntervention] = useState<string>(""); // datetime-local value
  const [duree, setDuree] = useState("");
  const [compteRendu, setCompteRendu] = useState("");
  const [statut, setStatut] = useState("programmé");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("🔒 Authentification requise");
    if (!patientId || !typeIntervention.trim() || !chirurgien.trim()) {
      return toast.warning("⚠️ Patient, intervention et chirurgien sont obligatoires");
    }

    setLoading(true);
    try {
      const payload = {
        patient_id: Number(patientId),
        type_intervention: typeIntervention.trim(),
        chirurgien: chirurgien.trim(),
        assistant1: assistant1 || null,
        assistant2: assistant2 || null,
        assistant3: assistant3 || null,
        assistant4: assistant4 || null,
        date_intervention: dateIntervention || null,
        duree: duree || null,
        compte_rendu: compteRendu || null,
        statut: statut || "programmé",
      };

      const res = await api.post("/bloc-operatoire", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Intervention créée");
      navigate(`/bloc-operatoire/${res.data.id}`);
    } catch (err: any) {
      console.error("AjouterBlocOperatoire error:", err);
      toast.error(err?.response?.data?.detail || "❌ Impossible de créer l'intervention");
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
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
      >
        <FaArrowLeft /> Retour
      </button>

      <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/30 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-3 text-purple-600 dark:text-purple-400">
          <FaUserMd /> Nouvelle Intervention - Bloc Opératoire
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            placeholder="ID Patient *"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value === "" ? "" : Number(e.target.value))}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <input
            type="text"
            placeholder="Type d'intervention *"
            value={typeIntervention}
            onChange={(e) => setTypeIntervention(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <input
            type="text"
            placeholder="Chirurgien *"
            value={chirurgien}
            onChange={(e) => setChirurgien(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Assistant 1"
              value={assistant1}
              onChange={(e) => setAssistant1(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Assistant 2"
              value={assistant2}
              onChange={(e) => setAssistant2(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Assistant 3"
              value={assistant3}
              onChange={(e) => setAssistant3(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Assistant 4"
              value={assistant4}
              onChange={(e) => setAssistant4(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
            />
          </div>

          <input
            type="datetime-local"
            value={dateIntervention}
            onChange={(e) => setDateIntervention(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <input
            type="text"
            placeholder="Durée (HH:MM)"
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <textarea
            placeholder="Compte rendu opératoire"
            value={compteRendu}
            onChange={(e) => setCompteRendu(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          >
            <option value="programmé">Programmé</option>
            <option value="en cours">En cours</option>
            <option value="terminé">Terminé</option>
            <option value="annulé">Annulé</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Enregistrement..." : "Créer l'intervention"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AjouterBlocOperatoire;
