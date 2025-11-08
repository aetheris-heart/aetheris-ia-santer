import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { FaExclamationTriangle, FaPills } from "react-icons/fa";
import { toast } from "react-toastify";

interface Pharmacie {
  id: number;
  nom: string;
  forme: string;
  dosage: string;
  categorie: string;
  quantite_stock: number;
  seuil_alerte: number;
  date_peremption?: string;
  etat: string;
}

const PharmacieAlerte: React.FC = () => {
  const { token } = useUser();
  const [alertes, setAlertes] = useState<Pharmacie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlertes = async () => {
      if (!token) return;
      try {
        const res = await api.get<Pharmacie[]>("/pharmacie", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 🔎 Filtrer : stock faible ou date proche/périmée
        const now = new Date();
        const filtered = res.data.filter((med) => {
          const isStockLow = med.quantite_stock <= med.seuil_alerte;
          const isExpired = med.date_peremption && new Date(med.date_peremption) < now;
          const isNearExpiry =
            med.date_peremption &&
            new Date(med.date_peremption).getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000; // ⚠️ moins d’une semaine
          return isStockLow || isExpired || isNearExpiry;
        });

        setAlertes(filtered);
      } catch (err) {
        toast.error("❌ Impossible de charger les alertes pharmacie");
      } finally {
        setLoading(false);
      }
    };

    fetchAlertes();
  }, [token]);

  return (
    <motion.div
      className="p-8 min-h-screen bg-transparent backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🔹 Header */}
      <div className="flex items-center gap-3 mb-8">
        <FaExclamationTriangle className="text-red-600 text-3xl" />
        <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400">
          Alertes Pharmacie
        </h1>
      </div>

      {/* 📊 Liste des alertes */}
      {loading ? (
        <p className="text-gray-500">⏳ Chargement...</p>
      ) : alertes.length === 0 ? (
        <p className="text-green-500 font-semibold">✅ Aucune alerte pour le moment</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {alertes.map((med) => (
            <motion.div
              key={med.id}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl shadow-xl bg-white/20 dark:bg-gray-800/40 backdrop-blur-md border border-red-400"
            >
              <div className="flex items-center gap-3">
                <FaPills className="text-red-500 text-2xl" />
                <h2 className="text-xl font-bold">{med.nom}</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {med.forme} – {med.dosage}
              </p>
              <p className="mt-2">
                <span className="font-semibold">Stock :</span> {med.quantite_stock} (alerte si ≤{" "}
                {med.seuil_alerte})
              </p>
              <p>
                <span className="font-semibold">État :</span> {med.etat}
              </p>
              <p>
                <span className="font-semibold">Péremption :</span>{" "}
                {med.date_peremption ? new Date(med.date_peremption).toLocaleDateString() : "—"}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PharmacieAlerte;
