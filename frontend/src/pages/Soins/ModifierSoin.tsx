import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaNotesMedical } from "react-icons/fa";
import type { Soin } from "./ListeSoins";

const ModifierSoin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<number>(0);
  const [typeSoin, setTypeSoin] = useState("");
  const [acte, setActe] = useState("");
  const [observations, setObservations] = useState("");
  const [effectuePar, setEffectuePar] = useState("");
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    const fetchSoin = async () => {
      setLoading(true);
      try {
        const res = await api.get<Soin>(`/soins/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const s = res.data;
        setPatientId(s.patient_id);
        setTypeSoin(s.type_soin);
        setActe(s.acte || "");
        setObservations(s.observations || "");
        setEffectuePar(s.effectue_par || "");
        setDate(s.date ? new Date(s.date).toISOString().slice(0, 16) : "");
      } catch (err: any) {
        toast.error("❌ Impossible de charger le soin");
        navigate("/soins");
      } finally {
        setLoading(false);
      }
    };
    fetchSoin();
  }, [id, token, navigate]);

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
      const res = await api.put(`/soins/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Soin modifié !");
      navigate(`/soins/${res.data.id}`);
    } catch (err: any) {
      console.error("ModifierSoin error:", err);
      toast.error("❌ Impossible de modifier le soin");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">⏳ Chargement...</p>;

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
          <FaNotesMedical /> Modifier Soin #{id}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={patientId}
            onChange={(e) => setPatientId(Number(e.target.value))}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <input
            type="text"
            value={typeSoin}
            onChange={(e) => setTypeSoin(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <input
            type="text"
            value={acte}
            onChange={(e) => setActe(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <input
            type="text"
            value={effectuePar}
            onChange={(e) => setEffectuePar(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <textarea
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
                       bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold 
                       shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Enregistrement..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ModifierSoin;
