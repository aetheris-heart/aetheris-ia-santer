import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Loader2,
  PlusCircle,
  Clock,
  MapPin,
  User,
  NotebookPen,
  Edit3,
  Trash2,
  RefreshCcw,
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
}

const RendezVousList: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [rendezvous, setRendezvous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");

  // 📅 Charger les rendez-vous
  const fetchRendezvous = async () => {
    try {
      const res = await api.get("/rendezvous", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRendezvous(res.data);
    } catch (err) {
      console.error("Erreur chargement rendez-vous :", err);
      toast.error("❌ Impossible de charger les rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRendezvous();
  }, [token]);

  // 🔍 Filtrage
  const filteredRdv = rendezvous.filter((r) => (filter === "tous" ? true : r.statut === filter));

  // 🗑️ Suppression
  const handleDelete = async (id: number) => {
    if (!window.confirm("🗑️ Supprimer ce rendez-vous ?")) return;
    try {
      await api.delete(`/rendezvous/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Rendez-vous supprimé !");
      setRendezvous((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
      toast.error("❌ Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-900 p-6 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl p-6"
      >
        {/* Header */}
<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
  <div className="flex items-center gap-3">
    <CalendarDays className="text-yellow-500 w-8 h-8" />
    <h1 className="text-3xl font-extrabold text-gray-800 dark:text-yellow-400">
      Liste des Rendez-vous
    </h1>
  </div>

  <div className="flex gap-3 items-center">
    {/* 🧠 Label invisible pour accessibilité */}
    <label
      htmlFor="filtre_rendezvous"
      className="sr-only"
    >
      Filtrer les rendez-vous par statut
    </label>

    <select
      id="filtre_rendezvous" // ✅ identifiant lié au label
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      aria-label="Filtrer les rendez-vous par statut" // ✅ double sécurité
      className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500"
    >
      <option value="tous">Tous</option>
      <option value="planifié">Planifié</option>
      <option value="confirmé">Confirmé</option>
      <option value="terminé">Terminé</option>
      <option value="annulé">Annulé</option>
    </select>

            <button
              onClick={fetchRendezvous}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
            >
              <RefreshCcw className="w-4 h-4" /> Actualiser
            </button>

            <button
              onClick={() => navigate("/ajouter-rendezvous")}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-yellow-500" />
          </div>
        ) : filteredRdv.length === 0 ? (
          <div className="text-center text-gray-500 py-10">Aucun rendez-vous trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-yellow-100/80 dark:bg-yellow-900/30 text-gray-900 dark:text-yellow-300">
                  <th className="p-3">🆔 ID</th>
                  <th className="p-3">👤 Patient</th>
                  <th className="p-3">🩺 Motif</th>
                  <th className="p-3">🕒 Date</th>
                  <th className="p-3">📍 Lieu</th>
                  <th className="p-3">📋 Statut</th>
                  <th className="p-3 text-right">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRdv.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 transition"
                  >
                    <td className="p-3">{r.id}</td>
                    <td className="p-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-yellow-500" /> {r.patient_id}
                    </td>
                    <td className="p-3">{r.motif}</td>
                    <td className="p-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />{" "}
                      {new Date(r.date_rdv).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-yellow-500" /> {r.lieu || "-"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          r.statut === "planifié"
                            ? "bg-yellow-400/30 text-yellow-800 dark:text-yellow-300"
                            : r.statut === "confirmé"
                              ? "bg-green-400/30 text-green-800 dark:text-green-300"
                              : r.statut === "terminé"
                                ? "bg-blue-400/30 text-blue-800 dark:text-blue-300"
                                : "bg-red-400/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {r.statut}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
  {/* 🧾 Voir détails */}
  <button
    onClick={() => navigate(`/rendezvous/${r.id}`)}
    aria-label={`Voir les détails du rendez-vous #${r.id}`}
    title={`Voir les détails du rendez-vous`}
    className="text-blue-500 hover:text-blue-400 transition transform hover:scale-110"
  >
    <NotebookPen className="w-5 h-5" aria-hidden="true" />
  </button>

  {/* ✏️ Modifier */}
  <button
    onClick={() => navigate(`/rendezvous/modifier/${r.id}`)}
    aria-label={`Modifier le rendez-vous #${r.id}`}
    title={`Modifier le rendez-vous`}
    className="text-yellow-500 hover:text-yellow-400 transition transform hover:scale-110"
  >
    <Edit3 className="w-5 h-5" aria-hidden="true" />
  </button>

  {/* 🗑️ Supprimer */}
  <button
    onClick={() => handleDelete(r.id)}
    aria-label={`Supprimer le rendez-vous #${r.id}`}
    title={`Supprimer le rendez-vous`}
    className="text-red-600 hover:text-red-500 transition transform hover:scale-110"
  >
    <Trash2 className="w-5 h-5" aria-hidden="true" />
  </button>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RendezVousList;
