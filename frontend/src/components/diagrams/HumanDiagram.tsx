import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

interface OrganeStats {
  status: "normal" | "alerte" | "critique";
  valeur: string;
}

interface HumanStats {
  cardiaque: OrganeStats;
  pulmonaire: OrganeStats;
  neurologique: OrganeStats;
  renale: OrganeStats;
  digestive: OrganeStats;
  metabolique: OrganeStats;
}

const HumanDiagram: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<HumanStats | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await api.get<HumanStats>("/dashboard/human", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        toast.error("❌ Impossible de charger les données du schéma humain");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const getColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-500";
      case "alerte":
        return "text-yellow-500 animate-pulse";
      case "critique":
        return "text-red-600 animate-ping";
      default:
        return "text-gray-400";
    }
  };

  return (
    <motion.div
      className="flex justify-center items-center p-6 bg-transparent backdrop-blur-lg rounded-xl shadow-xl border border-white/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative w-[300px] h-[600px]">
        {/* ✅ Silhouette humaine SVG premium */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 600"
          className="absolute inset-0 w-full h-full fill-gray-400/20 dark:fill-gray-600/30"
        >
          {/* tête */}
          <circle cx="150" cy="50" r="40" />
          {/* tronc */}
          <rect x="110" y="90" width="80" height="180" rx="40" />
          {/* bras */}
          <rect x="60" y="100" width="40" height="150" rx="20" />
          <rect x="200" y="100" width="40" height="150" rx="20" />
          {/* jambes */}
          <rect x="120" y="270" width="30" height="200" rx="15" />
          <rect x="150" y="270" width="30" height="200" rx="15" />
        </svg>

        {/* 🧠 Cerveau */}
        <motion.div
          className={`absolute top-[40px] left-[140px] ${getColor(stats?.neurologique?.status || "normal")} cursor-pointer`}
          onClick={() => navigate("/neurologie")}
          whileHover={{ scale: 1.2 }}
        >
          🧠 <span className="ml-1 text-xs">{stats?.neurologique?.valeur}</span>
        </motion.div>

        {/* ❤️ Cœur */}
        <motion.div
          className={`absolute top-[160px] left-[140px] ${getColor(stats?.cardiaque?.status || "normal")} cursor-pointer`}
          onClick={() => navigate("/cardiaque")}
          whileHover={{ scale: 1.2 }}
        >
          ❤️ <span className="ml-1 text-xs">{stats?.cardiaque?.valeur}</span>
        </motion.div>

        {/* 🫁 Poumons */}
        <motion.div
          className={`absolute top-[130px] left-[100px] ${getColor(stats?.pulmonaire?.status || "normal")} cursor-pointer`}
          onClick={() => navigate("/pulmonaire")}
          whileHover={{ scale: 1.2 }}
        >
          🫁 <span className="ml-1 text-xs">{stats?.pulmonaire?.valeur}</span>
        </motion.div>

        {/* 🔵 Reins */}
        <motion.div
          className={`absolute top-[240px] left-[100px] ${getColor(stats?.renale?.status || "normal")} cursor-pointer`}
          onClick={() => navigate("/renale")}
          whileHover={{ scale: 1.2 }}
        >
          🔵 <span className="ml-1 text-xs">{stats?.renale?.valeur}</span>
        </motion.div>

        {/* 🥗 Digestif */}
        <motion.div
          className={`absolute top-[220px] left-[160px] ${getColor(stats?.digestive?.status || "normal")} cursor-pointer`}
          onClick={() => navigate("/digestive")}
          whileHover={{ scale: 1.2 }}
        >
          🥗 <span className="ml-1 text-xs">{stats?.digestive?.valeur}</span>
        </motion.div>

        {/* ⚡ Métabolisme */}
        <motion.div
          className={`absolute top-[380px] left-[135px] ${getColor(stats?.metabolique?.status || "normal")} cursor-pointer`}
          onClick={() => navigate("/metabolique")}
          whileHover={{ scale: 1.2 }}
        >
          ⚡ <span className="ml-1 text-xs">{stats?.metabolique?.valeur}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HumanDiagram;
