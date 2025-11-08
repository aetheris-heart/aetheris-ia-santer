import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { CalendarCheck, Loader2, MapPin, NotebookPen, Clock, ArrowLeft } from "lucide-react";

interface RendezVous {
  id: number;
  patient_id: number;
  medecin_id: number;
  motif: string;
  statut: string;
  date_rdv: string;
  lieu?: string;
  notes?: string;
}

const ModifierRendezVous: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [rdv, setRdv] = useState<RendezVous | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔄 Charger les données existantes
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
        navigate("/rendezvous");
      } finally {
        setLoading(false);
      }
    };
    fetchRdv();
  }, [id, token, navigate]);

  // ✏️ Gérer les changements
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!rdv) return;
    setRdv({ ...rdv, [e.target.name]: e.target.value });
  };

  // 💾 Sauvegarder
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rdv) return;
    setSaving(true);

    try {
      await api.put(`/rendezvous/${id}`, rdv, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Rendez-vous mis à jour avec succès !");
      navigate(`/rendezvous/${id}`);
    } catch (err: any) {
      console.error("Erreur mise à jour rendez-vous :", err);
      toast.error(err.response?.data?.detail || "❌ Erreur de mise à jour");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center p-6 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/rendezvous/${rdv.id}`)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-yellow-500 transition"
          >
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-7 h-7 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-400">
              Modifier le Rendez-vous
            </h1>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Motif */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Motif
            </label>
            <input
              type="text"
              name="motif"
              value={rdv.motif}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" /> Date du rendez-vous
            </label>
            <input
              type="datetime-local"
              name="date_rdv"
              value={rdv.date_rdv?.slice(0, 16)}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-yellow-500" /> Lieu
            </label>
            <input
              type="text"
              name="lieu"
              value={rdv.lieu || ""}
              onChange={handleChange}
              placeholder="Ex: Cabinet B - étage 1"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Statut
            </label>
            <select
              name="statut"
              value={rdv.statut}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
            >
              <option value="planifié">Planifié</option>
              <option value="confirmé">Confirmé</option>
              <option value="annulé">Annulé</option>
              <option value="terminé">Terminé</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-yellow-500" /> Notes
            </label>
            <textarea
              name="notes"
              value={rdv.notes || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Remarques ou instructions..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/rendezvous")}
              className="w-1/2 py-3 rounded-lg font-semibold text-gray-800 dark:text-gray-200 bg-gray-200/60 dark:bg-gray-800/70 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              ⬅️ Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-1/2 py-3 rounded-lg font-semibold text-black bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Sauvegarde...
                </>
              ) : (
                "💾 Enregistrer"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ModifierRendezVous;
