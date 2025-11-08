import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { CalendarPlus, Loader2, MapPin, NotebookPen } from "lucide-react";

interface Patient {
  id: number;
  nom: string;
  prenom: string;
}

const AjouterRendezVous: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: "",
    motif: "",
    statut: "planifié",
    date_rdv: "",
    lieu: "",
    notes: "",
  });

  // 🧩 Charger la liste des patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        console.error("Erreur chargement patients :", err);
        toast.error("❌ Impossible de charger les patients");
      }
    };
    fetchPatients();
  }, [token]);

  // 🧠 Gérer les changements
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🟢 Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        patient_id: Number(formData.patient_id),
        motif: formData.motif,
        statut: formData.statut,
        date_rdv: formData.date_rdv,
        lieu: formData.lieu,
        notes: formData.notes,
      };

      const res = await api.post("/rendezvous/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Rendez-vous ajouté avec succès !");
      navigate(`/rendezvous/${res.data.id}`);
    } catch (err: any) {
      console.error("Erreur ajout rendez-vous :", err);
      toast.error(err.response?.data?.detail || "❌ Impossible d’ajouter le rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center p-6 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 p-8"
      >
        <div className="flex items-center justify-center mb-6">
          <CalendarPlus className="text-yellow-500 w-8 h-8 mr-2" />
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-yellow-400">
            Ajouter un Rendez-vous
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Patient concerné
            </label>
            <select
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500 transition"
            >
              <option value="">-- Sélectionner un patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} {p.prenom}
                </option>
              ))}
            </select>
          </div>

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Motif du rendez-vous
            </label>
            <input
              type="text"
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              placeholder="Ex: Contrôle cardiaque"
              required
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Date et heure */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Date et heure du rendez-vous
            </label>
            <input
              type="datetime-local"
              name="date_rdv"
              value={formData.date_rdv}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Lieu
            </label>
            <input
              type="text"
              name="lieu"
              value={formData.lieu}
              onChange={handleChange}
              placeholder="Ex: Salle 3 - Bloc B"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <NotebookPen className="w-4 h-4" /> Notes complémentaires
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Informations cliniques ou organisationnelles..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-black bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Création en cours...
              </>
            ) : (
              "✅ Enregistrer le rendez-vous"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AjouterRendezVous;
