import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/uui/ui_card";
import { BarChart3, Loader2 } from "lucide-react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface FinanceStats {
  total_revenus?: number;
  total_depenses?: number;
  solde_global?: number;
}

const FinanceCard: React.FC = () => {
  const { token } = useUser();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<FinanceStats>("/finance/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("❌ Erreur récupération stats finance :", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  if (loading)
    return (
      <Card className="bg-gray-900/60 border border-blue-800 text-white">
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-gray-400">Chargement...</span>
        </CardContent>
      </Card>
    );

  const formatNumber = (value?: number) =>
    typeof value === "number" ? value.toLocaleString("fr-FR") : "—";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
    >
      <Card
        onClick={() => navigate("/admin/finance")}
        className="cursor-pointer bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white hover:shadow-2xl transition-all border border-blue-700 rounded-2xl"
      >
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold tracking-wide">💰 Finance & Comptabilité</h2>
            <BarChart3 className="text-blue-400 w-6 h-6" />
          </div>

          {stats ? (
            <div className="space-y-3">
              {/* Revenus */}
              <p className="flex items-center justify-between">
                <span className="text-gray-300">Total Revenus</span>
                <span className="font-bold text-green-400">
                  +{formatNumber(stats.total_revenus)} €
                </span>
              </p>

              {/* Dépenses */}
              <p className="flex items-center justify-between">
                <span className="text-gray-300">Total Dépenses</span>
                <span className="font-bold text-red-400">
                  -{formatNumber(stats.total_depenses)} €
                </span>
              </p>

              <hr className="border-gray-700 my-2" />

              {/* Solde global */}
              <p className="flex items-center justify-between">
                <span className="text-gray-300">Solde Global</span>
                <span
                  className={`font-bold ${
                    (stats.solde_global ?? 0) >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {formatNumber(stats.solde_global)} €
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center">Aucune donnée disponible</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FinanceCard;
