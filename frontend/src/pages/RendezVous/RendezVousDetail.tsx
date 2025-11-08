import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import {
  CalendarDays,
  User,
  MapPin,
  Clock,
  NotebookPen,
  ArrowLeft,
  Loader2,
  BrainCircuit,
} from "lucide-react";

interface RendezVous {
  id: number;
  patient_id: number;
  medecin_id: number;
  motif: string;
  statut: string;
  date_rdv: string;
  lieu?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const RendezVousDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();
  const [rdv, setRdv] = useState<RendezVous | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger les données
  useEffect(() => {
    const fetchRdv = async () => {
      try {
        const res = await api.get(`/rendezvous/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRdv(res.data);
      } catch (err) {
        console.error("Erreur chargement rendez-vous :", err);
        toast.error("❌ Rendez-vous introuvable");
      } finally {
        setLoading(false);
      }
    };
    fetchRdv();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <Loader2 className="animate-spin w-8 h-8 text-yellow-500" />
      </div>
    );
  }

  if (!rdv) {
    return <div className="text-center text-gray-500 mt-20">Rendez-vous introuvable.</div>;
  }

  const dateFormat = new Date(rdv.date_rdv).toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-900 flex justify-center p-6 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/rendezvous")}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-yellow-500 transition"
          >
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-400">
              Détail du Rendez-vous
            </h1>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloc 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-200">
              <User className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Patient :</span> {rdv.patient_id}
            </div>

            <div className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-200">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Date :</span> {dateFormat}
            </div>

            <div className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-200">
              <MapPin className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Lieu :</span> {rdv.lieu || "Non précisé"}
            </div>

            <div className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-200">
              <NotebookPen className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Motif :</span> {rdv.motif}
            </div>

            <div className="text-lg">
              <span className="font-semibold text-yellow-500">Statut :</span>{" "}
              <span className="capitalize text-gray-900 dark:text-gray-200">{rdv.statut}</span>
            </div>
          </div>

          {/* Bloc 2 */}
          <div className="bg-gray-200/50 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-300 dark:border-gray-700 shadow-inner">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-yellow-400 mb-3 flex items-center gap-2">
              <NotebookPen className="w-5 h-5 text-yellow-500" /> Notes :
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {rdv.notes || "Aucune note enregistrée."}
            </p>
          </div>
        </div>

        {/* Section IA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-yellow-50/80 dark:bg-yellow-900/30 backdrop-blur-md border border-yellow-500/40 rounded-xl p-5 shadow-md"
        >
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="text-yellow-500 w-5 h-5" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-yellow-400">
              Suggestion d’Aetheris
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            🤖 D’après les antécédents du patient, il est recommandé d’effectuer un suivi ECG dans
            les 7 prochains jours.
          </p>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => navigate(`/rendezvous/modifier/${rdv.id}`)}
            className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition"
          >
            ✏️ Modifier
          </button>
          <button
            onClick={() => toast.info("🗑️ Suppression à venir...")}
            className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-red-600 text-white font-semibold transition"
          >
            Supprimer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RendezVousDetail;
