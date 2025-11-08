import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/uui/ui_card";
import { FaProcedures } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import type { BlocOperatoire } from "@/types";

const BlocOperatoireCard: React.FC = () => {
  const navigate = useNavigate();
  const [totalProgrammes, setTotalProgrammes] = useState(0);

  useEffect(() => {
    const fetchBlocs = async () => {
      try {
        // ✅ appel corrigé : slash final, plus besoin de headers manuels
        const res = await api.get<BlocOperatoire[]>("/bloc-operatoire/");
        const programmes = res.data.filter((b) => b.statut === "programmé").length;
        setTotalProgrammes(programmes);
      } catch (error) {
        console.error("❌ Erreur chargement blocs opératoires", error);
      }
    };

    fetchBlocs();
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        onClick={() => navigate("/bloc")}
        className="cursor-pointer shadow-xl hover:shadow-2xl transition duration-300 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl"
      >
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
              <FaProcedures size={28} className="text-red-600 dark:text-red-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Bloc opératoire</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Interventions programmées</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalProgrammes}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlocOperatoireCard;
