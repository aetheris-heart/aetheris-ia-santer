import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { BadgeCheck } from "lucide-react";

const ModulesPage: React.FC = () => {
  const { token } = useUser();
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      if (!token) return;
      try {
        const res = await api.get<string[]>("/modules", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModules(res.data);
      } catch (err) {
        console.error("Erreur chargement des modules :", err);
      }
    };
    fetchModules();
  }, [token]);

  return (
    <motion.div className="p-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">
        📦 Modules Aetheris Intégrés
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {modules.map((mod, index) => (
          <div
            key={index}
            className="p-4 rounded-xl shadow-md bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-white flex items-center gap-3 hover:scale-105 transition"
          >
            <BadgeCheck className="w-6 h-6" />
            <span className="font-semibold">{mod}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ModulesPage;
