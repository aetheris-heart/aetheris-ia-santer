import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

interface Biologie {
  id: number;
  type_analyse: string;
  categorie: string;
  resultats: string;
  interpretation?: string;
  etat: string;
  date_prelevement: string;
  prescripteur?: string;
  effectue_par?: string;
}

const BiologieDetail: React.FC = () => {
  const { token } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const [biologie, setBiologie] = useState<Biologie | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchBiologie = async () => {
      try {
        const res = await api.get(`/biologie/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBiologie(res.data);
      } catch {
        toast.error("❌ Analyse introuvable");
      }
    };
    fetchBiologie();
  }, [token, id]);

  if (!biologie) return <p className="text-center">Chargement...</p>;

  return (
    <motion.div className="p-6 bg-transparent">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">
        🔬 Détail Analyse Biologique
      </h2>

      <div className="bg-white/20 dark:bg-gray-800/40 backdrop-blur-lg p-6 rounded-xl shadow-lg">
        <p>
          <strong>Type :</strong> {biologie.type_analyse}
        </p>
        <p>
          <strong>Catégorie :</strong> {biologie.categorie}
        </p>
        <p>
          <strong>Résultats :</strong> {biologie.resultats}
        </p>
        <p>
          <strong>État :</strong> {biologie.etat}
        </p>
        <p>
          <strong>Prescripteur :</strong> {biologie.prescripteur || "N/A"}
        </p>
        <p>
          <strong>Effectué par :</strong> {biologie.effectue_par || "N/A"}
        </p>
        <p>
          <strong>Date :</strong> {new Date(biologie.date_prelevement).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={() => navigate(`/biologie/modifier/${biologie.id}`)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
        >
          ✏️ Modifier
        </button>
        <button
          onClick={async () => {
            try {
              await api.delete(`/biologie/${biologie.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              toast.success("✅ Analyse supprimée !");
              navigate("/biologie");
            } catch {
              toast.error("❌ Erreur suppression");
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          🗑 Supprimer
        </button>
      </div>
    </motion.div>
  );
};

export default BiologieDetail;
