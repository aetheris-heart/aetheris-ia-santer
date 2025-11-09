import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

  const patientData = [
    { name: "Patients", value: Math.max(totalPatients, 1), fill: "#3b82f6" },
  ];
  const consultationData = [
    { name: "Consultations", value: Math.max(totalConsultations, 1), fill: "#8b5cf6" },
  ];

  const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
      let start = 0;
      const duration = 800;
      const increment = value / (duration / 16);
      const interval = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else setDisplayValue(Math.floor(start));
      }, 16);
      return () => clearInterval(interval);
    }, [value]);
    return (
      <motion.span
        key={value}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-extrabold text-white drop-shadow-md"
      >
        {displayValue}
      </motion.span>
    );
  };

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
          className="relative p-6 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-xl shadow-xl text-center overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h3 className="text-lg font-semibold text-indigo-600 mb-4">
            👥 Évolution des patients
          </h3>
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <div className="relative w-full h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
  <RadialBarChart
    cx="50%"
    cy="50%"
    innerRadius="60%"
    outerRadius="90%"
    barSize={15}
    data={patientData}
    startAngle={90}
    endAngle={-270}
  >
    <RadialBar
      dataKey="value"
      cornerRadius={20}
      isAnimationActive
      background
    />
    <Legend
      iconSize={10}
      layout="vertical"
      verticalAlign="middle"
      align="right"
    />
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


              {/* 🔢 Compteur central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <AnimatedNumber value={totalPatients} />
                <span className="text-sm text-indigo-200 uppercase tracking-wide">
                  patients
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* 💜 Consultations */}
        <motion.div
          className="relative p-6 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-xl shadow-xl text-center overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h3 className="text-lg font-semibold text-purple-600 mb-4">
            🩺 Activité des consultations
          </h3>
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <div className="relative w-full h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
  <RadialBarChart
    cx="50%"
    cy="50%"
    innerRadius="60%"
    outerRadius="90%"
    barSize={15}
    data={consultationData}
    startAngle={90}
    endAngle={-270}
  >
    <RadialBar
      dataKey="value"
      cornerRadius={20}
      isAnimationActive
      background
    />
    <Legend
      iconSize={10}
      layout="vertical"
      verticalAlign="middle"
      align="right"
    />
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


              {/* 🔢 Compteur central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <AnimatedNumber value={totalConsultations} />
                <span className="text-sm text-purple-200 uppercase tracking-wide">
                  consultations
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* 🧠 Synthèse IA */}
      <div className="grid grid-cols-1 mt-6">
        <SyntheseCard patientId={user?.id?.toString() || ""} />
      </div>

     {/* 🩺 Fonctions vitales */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
  <CardioCard patientId={Number(user?.id) || 0} />
  <PulmonaireCard patientId={Number(user?.id) || 0} />
  <NeurologicalCard patientId={Number(user?.id) || 0} />
  <RenalCard patientId={String(user?.id || "")} />

  <DigestiveCard patientId={Number(user?.id) || 0} />
  <MetaboliqueCard patientId={Number(user?.id) || 0} />
  <BiologieAnalyseCard />
  <SoinsCard />
  <BlocOperatoireCard />
 <RadiologieCard />

</div>

    </motion.div>
  );
};

export default Dashboard;
