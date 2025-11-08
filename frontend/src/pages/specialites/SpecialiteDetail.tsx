import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { FaArrowLeft, FaUserMd, FaUsers, FaHeartbeat } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Specialite {
  id: number;
  nom: string;
  description?: string;
  icone?: string;
  couleur?: string;
}

interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
}

interface Stat {
  name: string;
  value: number;
}

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

const SpecialiteDetail: React.FC = () => {
  const { token } = useUser();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [specialite, setSpecialite] = useState<Specialite | null>(null);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger la spécialité
        const res = await api.get(`/specialites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSpecialite(res.data);

        // Charger médecins associés (si API existe)
        const med = await api.get(`/users?specialite_id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedecins(med.data);

        // ⚡ Exemple stats simulées (patients par mois)
        setStats([
          { name: "Patients", value: 120 },
          { name: "Consultations", value: 80 },
          { name: "Diagnostics", value: 40 },
        ]);
      } catch {
        toast.error("❌ Impossible de charger la spécialité");
      }
    };
    fetchData();
  }, [id, token]);

  if (!specialite) return <p>Chargement...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/specialites")}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
        >
          <FaArrowLeft /> Retour
        </button>
        <h1
          className="text-3xl font-bold flex items-center gap-2"
          style={{ color: specialite.couleur || "#4f46e5" }}
        >
          {specialite.icone || "🩺"} {specialite.nom}
        </h1>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow mb-6"
      >
        <h2 className="text-xl font-semibold mb-2">📝 Description</h2>
        <p className="text-gray-700 dark:text-gray-300">
          {specialite.description || "Aucune description disponible."}
        </p>
      </motion.div>

      {/* Médecins */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow mb-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaUserMd /> Médecins associés
        </h2>
        {medecins.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medecins.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow"
              >
                <img
                  src={m.photo || "/default-doctor.png"}
                  alt={m.nom}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">
                    Dr {m.prenom} {m.nom}
                  </p>
                  <p className="text-sm text-gray-500">{m.email}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aucun médecin lié à cette spécialité.</p>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaUsers /> Statistiques
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {stats.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default SpecialiteDetail;
