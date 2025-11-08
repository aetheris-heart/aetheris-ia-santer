import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaUserMd } from "react-icons/fa";

const ModifierBlocOperatoire: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<number | "">("");
  const [typeIntervention, setTypeIntervention] = useState("");
  const [chirurgien, setChirurgien] = useState("");
  const [assistant1, setAssistant1] = useState("");
  const [assistant2, setAssistant2] = useState("");
  const [assistant3, setAssistant3] = useState("");
  const [assistant4, setAssistant4] = useState("");
  const [dateIntervention, setDateIntervention] = useState<string>("");
  const [duree, setDuree] = useState("");
  const [compteRendu, setCompteRendu] = useState("");
  const [statut, setStatut] = useState("programmé");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    const ctrl = new AbortController();

    const fetchBloc = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/bloc-operatoire/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal as any,
        });
        const b = res.data;
        setPatientId(b.patient_id);
        setTypeIntervention(b.type_intervention || "");
        setChirurgien(b.chirurgien || "");
        setAssistant1(b.assistant1 || "");
        setAssistant2(b.assistant2 || "");
        setAssistant3(b.assistant3 || "");
        setAssistant4(b.assistant4 || "");
        setDateIntervention(
          b.date_intervention ? new Date(b.date_intervention).toISOString().slice(0, 16) : ""
        );
        setDuree(b.duree || "");
        setCompteRendu(b.compte_rendu || "");
        setStatut(b.statut || "programmé");
      } catch (err: any) {
        console.error("ModifierBlocOperatoire fetch error:", err);
        if (err?.response?.status === 404) {
          toast.error("❌ Intervention introuvable");
          navigate("/bloc-operatoire");
        } else if (err?.response?.status === 401) {
          toast.error("🔒 Session expirée");
          navigate("/login");
        } else {
          toast.error("❌ Impossible de charger l'intervention");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBloc();
    return () => ctrl.abort();
  }, [id, token, navigate]);

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
        statut,
      };

      const res = await api.put(`/bloc-operatoire/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Intervention mise à jour");
      navigate(`/bloc-operatoire/${res.data.id}`);
    } catch (err: any) {
      console.error("ModifierBlocOperatoire PUT error:", err);
      toast.error(err?.response?.data?.detail || "❌ Impossible de mettre à jour");
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
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-3 text-purple-600 dark:text-purple-400">
          <FaUserMd /> Modifier Intervention #{id}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value === "" ? "" : Number(e.target.value))}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <input
            type="text"
            value={typeIntervention}
            onChange={(e) => setTypeIntervention(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <input
            type="text"
            value={chirurgien}
            onChange={(e) => setChirurgien(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={assistant1}
              onChange={(e) => setAssistant1(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
              placeholder="Assistant 1"
            />
            <input
              type="text"
              value={assistant2}
              onChange={(e) => setAssistant2(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
              placeholder="Assistant 2"
            />
            <input
              type="text"
              value={assistant3}
              onChange={(e) => setAssistant3(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
              placeholder="Assistant 3"
            />
            <input
              type="text"
              value={assistant4}
              onChange={(e) => setAssistant4(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
              placeholder="Assistant 4"
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
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            placeholder="Durée (HH:MM)"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/10 dark:bg-gray-800/10 text-gray-900 dark:text-gray-100"
          />

          <textarea
            value={compteRendu}
            onChange={(e) => setCompteRendu(e.target.value)}
            rows={4}
            placeholder="Compte rendu opératoire"
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Enregistrement..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ModifierBlocOperatoire;
