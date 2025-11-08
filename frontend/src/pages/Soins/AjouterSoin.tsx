import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaNotesMedical } from "react-icons/fa";

const AjouterSoin: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<number>(0);
  const [typeSoin, setTypeSoin] = useState("");
  const [acte, setActe] = useState("");
  const [observations, setObservations] = useState("");
  const [effectuePar, setEffectuePar] = useState("");
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("🔒 Authentification requise");
    if (!patientId || !typeSoin.trim())
      return toast.warning("⚠️ Patient et type de soin sont obligatoires");

    setLoading(true);
    try {
      const payload = {
        patient_id: Number(patientId),
        type_soin: typeSoin.trim(),
        acte: acte || null,
        observations: observations || null,
        effectue_par: effectuePar || null,
        date: date || null,
      };
      const res = await api.post("/soins", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Soin enregistré !");
      navigate(`/soins/${res.data.id}`);
    } catch (err: any) {
      console.error("AjouterSoin error:", err);
      toast.error(err?.response?.data?.detail || "❌ Impossible d’ajouter le soin");
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
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <FaNotesMedical /> Nouveau Soin Infirmier
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            placeholder="ID Patient *"
            value={patientId}
            onChange={(e) => setPatientId(Number(e.target.value))}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100 
                       focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <input
            type="text"
            placeholder="Type de soin *"
            value={typeSoin}
            onChange={(e) => setTypeSoin(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100 
                       focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <input
            type="text"
            placeholder="Acte"
            value={acte}
            onChange={(e) => setActe(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <input
            type="text"
            placeholder="Effectué par"
            value={effectuePar}
            onChange={(e) => setEffectuePar(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <textarea
            placeholder="Observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
                       bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold 
                       shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AjouterSoin;
