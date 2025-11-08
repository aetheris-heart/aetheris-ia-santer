import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Activity,
  MapPin,
  Clock,
  Stethoscope,
  User,
  HeartPulse,
  Ambulance,
} from "lucide-react";

// ===================== Interfaces =====================
interface Urgence {
  id: number;
  nom_patient: string;
  prenom_patient?: string;
  type_urgence: string;
  description?: string;
  niveau_gravite?: string;
  statut?: string;
  lieu?: string;
  risque_vital?: string;
  niveau_risque_ia?: string;
  recommandation_ia?: string;
  date_signalement?: string;
  updated_at?: string;
}

// ===================== Composant =====================
const ListeUrgences: React.FC = () => {
  const [urgences, setUrgences] = useState<Urgence[]>([]);
  const { token } = useUser();
  const navigate = useNavigate();

  // 🔁 Récupération des urgences
  const fetchUrgences = async () => {
    try {
      const res = await api.get<Urgence[]>("/urgences", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUrgences(res.data);
    } catch (error) {
      console.error("Erreur récupération urgences :", error);
      toast.error("❌ Impossible de charger les urgences !");
    }
  };

  useEffect(() => {
    fetchUrgences();
    const interval = setInterval(fetchUrgences, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // 🌈 Badge visuel de gravité
  const getBadge = (gravite?: string) => {
    switch (gravite) {
      case "Critique":
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
            🚨 Critique
          </span>
        );
      case "Modérée":
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
            ⚠️ Modérée
          </span>
        );
      case "Faible":
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            ✅ Faible
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
            ❔ Inconnue
          </span>
        );
    }
  };

  // 🩺 Couleur bordure selon gravité
  const borderColor = (gravite?: string) => {
    if (gravite === "Critique") return "border-red-500 shadow-red-300/40";
    if (gravite === "Modérée") return "border-yellow-500 shadow-yellow-300/40";
    if (gravite === "Faible") return "border-green-500 shadow-green-300/40";
    return "border-gray-400 shadow-gray-200/40";
  };

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
          🚑 Urgences Médicales
        </h1>
        <button
          onClick={() => navigate("/urgences/ajouter")}
          className="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition flex items-center gap-2"
        >
          ➕ Ajouter
        </button>
      </div>

      {/* Grille des urgences */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {urgences.length > 0 ? (
          urgences.map((u) => (
            <motion.div
              key={u.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/urgences/${u.id}`)}
              className={`cursor-pointer bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border ${borderColor(
                u.niveau_gravite
              )} rounded-xl shadow-lg p-5 transition hover:shadow-xl`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="text-red-600 w-5 h-5" />
                  {u.type_urgence}
                </h2>
                {getBadge(u.niveau_gravite)}
              </div>

              <p className="mt-2 text-gray-700 dark:text-gray-200 text-sm line-clamp-2">
                {u.description || "Aucune description fournie."}
              </p>

              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  {u.nom_patient} {u.prenom_patient || ""}
                </p>
                {u.lieu && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    {u.lieu}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {u.date_signalement ? new Date(u.date_signalement).toLocaleString("fr-FR") : "—"}
                </p>
                {u.risque_vital && (
                  <p className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    Risque vital :{" "}
                    <span className="font-semibold text-red-600">{u.risque_vital}</span>
                  </p>
                )}
                {u.niveau_risque_ia && (
                  <p className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    IA : {u.niveau_risque_ia}
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <span className="text-xs text-gray-500 italic">
                  {u.updated_at
                    ? `Mise à jour : ${new Date(u.updated_at).toLocaleString("fr-FR")}`
                    : ""}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full mt-10">
            Aucune urgence signalée pour le moment 💫
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ListeUrgences;
