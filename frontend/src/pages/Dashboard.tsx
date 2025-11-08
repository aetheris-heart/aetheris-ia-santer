import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 🧠 Cartes fonctionnelles
import CardioCard from "@/components/card/CardioCard";
import PulmonaireCard from "@/components/card/PulmonaireCard";
import NeurologicalCard from "@/components/card/NeurologicalCard";
import RenalCard from "@/components/card/RenalCard";
import DigestiveCard from "@/components/card/DigestiveCard";
import MetaboliqueCard from "@/components/card/MetabolicCard";
import SoinsCard from "@/components/card/SoinsCard";
import RadiologieCard from "@/components/card/RadiologieCard";
import BiologieAnalyseCard from "@/components/card/BiologieAnalyseCard";
import SyntheseCard from "@/components/card/SyntheseCard";
import BlocOperatoireCard from "@/components/card/BlocOperatoireCard";

interface MonthlyData {
  mois: string;
  total: number;
}

const Dashboard: React.FC = () => {
  const { user, token } = useUser();
  const [patientsPerMonth, setPatientsPerMonth] = useState<MonthlyData[]>([]);
  const [consultationsPerMonth, setConsultationsPerMonth] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, consultationsRes] = await Promise.all([
          api.get<MonthlyData[]>("/dashboard/stats/patients-per-month", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get<MonthlyData[]>("/dashboard/stats/consultations-per-month", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPatientsPerMonth(patientsRes.data);
        setConsultationsPerMonth(consultationsRes.data);
      } catch (err) {
        console.error("❌ Erreur lors du chargement des statistiques :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const totalPatients = patientsPerMonth.reduce((acc, p) => acc + (p.total || 0), 0);
  const totalConsultations = consultationsPerMonth.reduce((acc, c) => acc + (c.total || 0), 0);

  const patientData = [{ name: "Patients", value: totalPatients, fill: "#3b82f6" }];

  const consultationData = [{ name: "Consultations", value: totalConsultations, fill: "#8b5cf6" }];

  return (
    <motion.div
      className="p-6 space-y-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 👋 Message de bienvenue */}
      <div className="text-center text-3xl font-bold text-blue-700 dark:text-blue-400">
        Bienvenue, {user?.prenom} {user?.nom} 🧠
      </div>

      {/* 📊 Graphiques circulaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🩵 Patients */}
        <motion.div
          className="p-6 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-xl shadow-xl text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h3 className="text-lg font-semibold text-indigo-600 mb-4">👥 Évolution des patients</h3>
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                barSize={15}
                data={patientData}
              >
                <RadialBar minAngle={15} clockWise dataKey="value" cornerRadius={20} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(20,20,20,0.8)",
                    borderRadius: "10px",
                    border: "none",
                    color: "#fff",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Total : <span className="font-semibold">{totalPatients}</span> patients
          </p>
        </motion.div>

        {/* 💜 Consultations */}
        <motion.div
          className="p-6 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-xl shadow-xl text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h3 className="text-lg font-semibold text-purple-600 mb-4">
            🩺 Activité des consultations
          </h3>
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                barSize={15}
                data={consultationData}
              >
                <RadialBar minAngle={15} clockWise dataKey="value" cornerRadius={20} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(20,20,20,0.8)",
                    borderRadius: "10px",
                    border: "none",
                    color: "#fff",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Total : <span className="font-semibold">{totalConsultations}</span> consultations
          </p>
        </motion.div>
      </div>

      {/* 🧠 Synthèse IA */}
      <div className="grid grid-cols-1 mt-6">
        <SyntheseCard patientId={user?.id?.toString() || ""} />
      </div>

      {/* 🩺 Fonctions vitales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        <CardioCard patientId={user?.id?.toString() || ""} />
        <PulmonaireCard patientId={user?.id?.toString() || ""} />
        <NeurologicalCard patientId={user?.id?.toString() || ""} />
        <RenalCard patientId={user?.id?.toString() || ""} />
        <DigestiveCard patientId={user?.id?.toString() || ""} />
        <MetaboliqueCard patientId={user?.id?.toString() || ""} />
        <BiologieAnalyseCard />
        <SoinsCard />
        <BlocOperatoireCard />
        <RadiologieCard patientId={user?.id || 0} />
      </div>
    </motion.div>
  );
};

export default Dashboard;
