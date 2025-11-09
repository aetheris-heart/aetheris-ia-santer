import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import type { BlocOperatoire, Patient } from "@/types";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  FaPlus,
  FaStethoscope,
  FaClock,
  FaCheckCircle,
  FaRobot,
  FaEye,
  FaTrash,
  FaUserMd,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { UIButton } from "@/components/uui/ui_button";
import { Card, CardContent } from "@/components/uui/ui_card";

const Bloc: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [blocs, setBlocs] = useState<BlocOperatoire[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ State local pour le filtre (statut bloc)
  const [form, setForm] = useState({
    statut_bloc: "",
  });

  // 🔄 Gestion du changement dans le select
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🎨 Couleurs pour graphique
  const COLORS = ["#6366F1", "#F59E0B", "#10B981"];

  // 📥 Charger les blocs opératoires
  const fetchBlocs = async () => {
    try {
      const res = await api.get<BlocOperatoire[]>("/bloc-operatoire", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlocs(res.data);
    } catch {
      toast.error("Erreur lors du chargement des blocs opératoires");
    } finally {
      setLoading(false);
    }
  };

  // 📥 Charger les patients
  const fetchPatients = async () => {
    try {
      const res = await api.get<Patient[]>("/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch {
      console.error("Erreur chargement patients");
    }
  };

  useEffect(() => {
    if (token) {
      fetchBlocs();
      fetchPatients();
    }
  }, [token]);

  // ❌ Supprimer un bloc
  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer la suppression de ce bloc ?")) return;
    try {
      await api.delete(`/bloc-operatoire/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Bloc supprimé !");
      fetchBlocs();
    } catch {
      toast.error("❌ Erreur de suppression");
    }
  };

  // 📊 Statistiques
  const blocsProgrammes = blocs.filter((b) => b.statut?.toLowerCase() === "programmé").length;
  const blocsEnCours = blocs.filter((b) => b.statut?.toLowerCase() === "en cours").length;
  const blocsTermines = blocs.filter((b) => b.statut?.toLowerCase() === "terminé").length;

  const data = [
    { name: "Programmés", value: blocsProgrammes },
    { name: "En cours", value: blocsEnCours },
    { name: "Terminés", value: blocsTermines },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-300 animate-pulse">
        ⏳ Chargement des données du bloc opératoire...
      </div>
    );
  }

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🏥 En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent flex items-center gap-3">
          <FaUserMd className="text-indigo-500" />
          Gestion du Bloc Opératoire
        </h1>

        <UIButton
          onClick={() => navigate("/bloc-operatoire/ajouter")}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:scale-105 transition"
        >
          <FaPlus className="mr-2" /> Nouvelle Intervention
        </UIButton>
      </div>

      {/* 📊 Statistiques + graphique */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardContent className="flex items-center gap-4">
            <FaClock className="text-yellow-500 text-3xl" />
            <div>
              <p className="text-sm text-gray-500">Programmés</p>
              <p className="text-2xl font-bold">{blocsProgrammes}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <FaStethoscope className="text-blue-500 text-3xl" />
            <div>
              <p className="text-sm text-gray-500">En cours</p>
              <p className="text-2xl font-bold">{blocsEnCours}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <FaCheckCircle className="text-green-500 text-3xl" />
            <div>
              <p className="text-sm text-gray-500">Terminés</p>
              <p className="text-2xl font-bold">{blocsTermines}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={50} label>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 🧾 Liste des interventions */}
<div className="bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
    Liste des interventions
  </h2>

  <ul className="space-y-4">
    {blocs
      .filter(
        (bloc) =>
          (!selectedPatientId || bloc.patient_id === selectedPatientId) &&
          (!form.statut_bloc || bloc.statut === form.statut_bloc)
      )
      .map((bloc) => (
        <li key={bloc.id} className="list-none">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-gray-800/40 flex justify-between items-center"
            role="listitem"
          >
            <div>
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                {bloc.type_intervention}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {bloc.chirurgien || "Chirurgien inconnu"} —{" "}
                <span className="capitalize">{bloc.statut}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <UIButton
                onClick={() => navigate(`/bloc-operatoire/${bloc.id}`)}
                className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
              >
                <FaEye className="mr-1" /> Voir
              </UIButton>
              <UIButton
                onClick={() => navigate(`/bloc-operatoire/analyse/${bloc.id}`)}
                className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700"
              >
                <FaRobot className="mr-1" /> IA
              </UIButton>
              <UIButton
                onClick={() => handleDelete(bloc.id)}
                className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
              >
                <FaTrash className="mr-1" /> Suppr.
              </UIButton>
            </div>
          </motion.div>
        </li>
      ))}
  </ul>
</div>

    </motion.div>
  );
};

export default Bloc;
