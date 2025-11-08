import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaHospitalUser } from "react-icons/fa";

const ModifierHospitalisation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<number>(0);
  const [service, setService] = useState("");
  const [chambre, setChambre] = useState("");
  const [lit, setLit] = useState("");
  const [motif, setMotif] = useState("");
  const [observations, setObservations] = useState("");
  const [statut, setStatut] = useState("en cours");
  const [loading, setLoading] = useState(false);

  // 📥 Charger hospitalisation existante
  useEffect(() => {
    if (!token || !id) return;

    setLoading(true);
    api
      .get(`/hospitalisations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const h = res.data;
        setPatientId(h.patient_id);
        setService(h.service);
        setChambre(h.chambre || "");
        setLit(h.lit || "");
        setMotif(h.motif || "");
        setObservations(h.observations || "");
        setStatut(h.statut || "en cours");
      })
      .catch(() => toast.error("❌ Impossible de charger l’hospitalisation"))
      .finally(() => setLoading(false));
  }, [id, token]);

  // ✅ Soumission modification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("🔒 Authentification requise");
      return;
    }

    setLoading(true);
    try {
      await api.put(
        `/hospitalisations/${id}`,
        {
          patient_id: patientId,
          service,
          chambre: chambre || null,
          lit: lit || null,
          motif: motif || null,
          observations: observations || null,
          statut,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Hospitalisation modifiée avec succès !");
      navigate(`/hospitalisations/${id}`);
    } catch (err: any) {
      console.error("❌ Erreur modification hospitalisation :", err);
      toast.error("❌ Impossible de modifier l’hospitalisation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">⏳ Chargement...</p>;
  }

  return (
    <motion.div
      className="p-8 min-h-screen bg-transparent backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
      >
        <FaArrowLeft /> Retour
      </button>

      {/* Formulaire */}
      <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <FaHospitalUser /> Modifier Hospitalisation #{id}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              🧑 ID Patient *
            </label>
            <input
              type="number"
              value={patientId}
              onChange={(e) => setPatientId(Number(e.target.value))}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service *
            </label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Chambre / Lit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Chambre
              </label>
              <input
                type="text"
                value={chambre}
                onChange={(e) => setChambre(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lit
              </label>
              <input
                type="text"
                value={lit}
                onChange={(e) => setLit(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Motif
            </label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observations
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut
            </label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="en cours">En cours</option>
              <option value="terminé">Terminé</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
            bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Enregistrement..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ModifierHospitalisation;
