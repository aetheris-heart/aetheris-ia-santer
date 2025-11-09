import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSave, FaHospitalUser } from "react-icons/fa";

const AjouterHospitalisation: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  // 🏥 Champs du formulaire
  const [patientId, setPatientId] = useState<number>(0);
  const [service, setService] = useState("");
  const [chambre, setChambre] = useState("");
  const [lit, setLit] = useState("");
  const [motif, setMotif] = useState("");
  const [observations, setObservations] = useState("");
  const [statut, setStatut] = useState("en cours");
  const [loading, setLoading] = useState(false);

  // ✅ Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("🔒 Authentification requise");
      return;
    }
    if (!patientId || !service.trim()) {
      toast.warning("⚠️ Patient et service sont obligatoires !");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        "/hospitalisations/",
        {
          patient_id: patientId, // 👈 correspond au backend
          service,
          chambre: chambre || null,
          lit: lit || null,
          motif: motif || null,
          observations: observations || null,
          statut: statut || "en cours",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Hospitalisation ajoutée avec succès !");
      navigate(`/hospitalisations/${res.data.id}`);
    } catch (err: any) {
      console.error("❌ Erreur ajout hospitalisation :", err);

      if (err.response) {
        console.error("🔍 Réponse backend :", err.response.data);
        toast.error(`❌ ${err.response.data.detail || "Erreur côté serveur"}`);
      } else if (err.request) {
        console.error("📡 Pas de réponse reçue :", err.request);
        toast.error("❌ Pas de réponse du serveur (connexion perdue ?)");
      } else {
        console.error("⚙️ Erreur requête :", err.message);
        toast.error("❌ Erreur lors de la préparation de la requête.");
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
    >
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow hover:scale-105 transition"
      >
        <FaArrowLeft /> Retour
      </button>

      {/* Formulaire */}
      <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <FaHospitalUser /> Nouvelle Hospitalisation
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
  <label
    htmlFor="statut"
    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
  >
    Statut
  </label>

  <select
    id="statut"
    name="statut"
    title="Statut de l’hospitalisation"
    aria-label="Statut de l’hospitalisation"
    value={statut}
    onChange={(e) => setStatut(e.target.value)}
    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
      bg-white/60 dark:bg-gray-800/60 focus:ring-2 focus:ring-purple-500 outline-none"
    required
  >
    <option value="en cours">🟣 En cours</option>
    <option value="terminé">✅ Terminé</option>
    <option value="annulé">❌ Annulé</option>
  </select>
</div>


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
            bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AjouterHospitalisation;
