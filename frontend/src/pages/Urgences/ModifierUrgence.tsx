import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Activity,
  Clock,
  MapPin,
  User,
  Ambulance,
  ShieldCheck,
} from "lucide-react";

const ModifierUrgence: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useUser();

  // 🔹 États
  const [urgence, setUrgence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger les données existantes
  useEffect(() => {
    const fetchUrgence = async () => {
      try {
        const res = await api.get(`/urgences/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUrgence(res.data);
        setLoading(false);
      } catch {
        toast.error("❌ Erreur lors du chargement de l'urgence");
        setLoading(false);
      }
    };
    fetchUrgence();
  }, [id, token]);

  // ✏️ Soumettre les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        description: urgence.description,
        niveau_gravite: urgence.niveau_gravite,
        statut: urgence.statut,
        equipe: urgence.equipe,
        lieu: urgence.lieu,
        moyen_transport: urgence.moyen_transport,
        analyse_ia: urgence.analyse_ia,
        niveau_risque_ia: urgence.niveau_risque_ia,
        recommandation_ia: urgence.recommandation_ia,
      };

      await api.put(`/urgences/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Urgence mise à jour avec succès !");
      navigate("/urgences");
    } catch (err: any) {
      console.error("Erreur PUT urgence :", err.response?.data || err.message);
      toast.error("❌ Erreur lors de la modification de l'urgence");
    }
  };

  if (loading)
    return <p className="text-center text-gray-500 mt-8">Chargement des informations...</p>;

  if (!urgence) return <p className="text-center text-gray-500 mt-8">Urgence introuvable ❌</p>;

  return (
    <motion.div
      className="max-w-3xl mx-auto p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
        ✏️ Modifier l’Urgence #{urgence.id}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-6"
      >
        {/* 👤 Infos Patient */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <User className="text-blue-500 w-5 h-5" /> Patient concerné
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={urgence.nom_patient}
              disabled
              className="input-style bg-gray-100 dark:bg-gray-700"
            />
            <input
              value={urgence.prenom_patient || ""}
              disabled
              className="input-style bg-gray-100 dark:bg-gray-700"
            />
          </div>
        </div>

        {/* ⚠️ Détails médicaux */}
<div>
  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-200">
    <AlertTriangle className="text-red-500 w-5 h-5" /> Détails de l’urgence
  </h2>
  <div className="grid md:grid-cols-2 gap-4">
    {/* 🔹 Niveau de gravité */}
    <label htmlFor="niveau_gravite" className="sr-only">Niveau de gravité</label>
    <select
      id="niveau_gravite"
      value={urgence.niveau_gravite}
      onChange={(e) => setUrgence({ ...urgence, niveau_gravite: e.target.value })}
      aria-label="Niveau de gravité"
      className="input-style"
    >
      <option>Faible</option>
      <option>Modérée</option>
      <option>Critique</option>
    </select>

    {/* 🔹 Statut */}
    <label htmlFor="statut" className="sr-only">Statut de l’urgence</label>
    <select
      id="statut"
      value={urgence.statut}
      onChange={(e) => setUrgence({ ...urgence, statut: e.target.value })}
      aria-label="Statut de l’urgence"
      className="input-style"
    >
      <option>En attente</option>
      <option>En cours</option>
      <option>Pris en charge</option>
      <option>Résolue</option>
    </select>
  </div>

  <textarea
    value={urgence.description || ""}
    onChange={(e) => setUrgence({ ...urgence, description: e.target.value })}
    placeholder="Description de l’urgence"
    className="input-style w-full mt-3"
    rows={3}
  />
</div>

{/* 🚑 Logistique */}
<div>
  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-200">
    <Ambulance className="text-emerald-500 w-5 h-5" /> Logistique
  </h2>
  <div className="grid md:grid-cols-2 gap-4">
    <input
      value={urgence.equipe || ""}
      onChange={(e) => setUrgence({ ...urgence, equipe: e.target.value })}
      placeholder="Équipe d’intervention"
      className="input-style"
    />
    <input
      value={urgence.lieu || ""}
      onChange={(e) => setUrgence({ ...urgence, lieu: e.target.value })}
      placeholder="Lieu d’intervention"
      className="input-style"
    />

    {/* 🔹 Moyen de transport */}
    <label htmlFor="moyen_transport" className="sr-only">Moyen de transport</label>
    <select
      id="moyen_transport"
      value={urgence.moyen_transport || ""}
      onChange={(e) => setUrgence({ ...urgence, moyen_transport: e.target.value })}
      aria-label="Moyen de transport"
      className="input-style"
    >
      <option>Ambulance</option>
      <option>Hélicoptère</option>
      <option>Autre</option>
    </select>
  </div>
</div>

        {/* 🧠 Analyse IA */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <Brain className="text-purple-500 w-5 h-5" /> Analyse IA (Aetheris)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={urgence.niveau_risque_ia || ""}
              onChange={(e) => setUrgence({ ...urgence, niveau_risque_ia: e.target.value })}
              placeholder="Niveau de risque IA"
              className="input-style"
            />
            <input
              value={urgence.recommandation_ia || ""}
              onChange={(e) => setUrgence({ ...urgence, recommandation_ia: e.target.value })}
              placeholder="Recommandation IA"
              className="input-style"
            />
          </div>
          <textarea
            value={urgence.analyse_ia || ""}
            onChange={(e) => setUrgence({ ...urgence, analyse_ia: e.target.value })}
            placeholder="Analyse IA complète (facultatif)"
            className="input-style w-full mt-3"
            rows={3}
          />
        </div>

        {/* 🕓 Dates */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <Clock className="text-gray-500 w-5 h-5" /> Suivi temporel
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Signalement :{" "}
            {urgence.date_signalement
              ? new Date(urgence.date_signalement).toLocaleString("fr-FR")
              : "—"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dernière mise à jour :{" "}
            {urgence.updated_at ? new Date(urgence.updated_at).toLocaleString("fr-FR") : "—"}
          </p>
        </div>

        {/* 🔘 Actions */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="w-1/2 bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            💾 Enregistrer
          </button>
          <button
            type="button"
            onClick={() => navigate("/urgences")}
            className="w-1/2 bg-gray-500 text-white py-2 rounded-lg shadow hover:bg-gray-600 transition"
          >
            ❌ Annuler
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ModifierUrgence;

// 🔹 Utilise la même classe globale que le module d’ajout
// .input-style {
//   @apply w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white;
// }
