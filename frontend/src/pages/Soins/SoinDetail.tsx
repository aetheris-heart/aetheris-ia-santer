import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import type { Soin } from "./ListeSoins";

const SoinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [soin, setSoin] = useState<Soin | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSoin = async () => {
    if (!token || !id) return;
    try {
      const res = await api.get<Soin>(`/soins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSoin(res.data);
    } catch (err: any) {
      toast.error("❌ Soin introuvable ou inaccessible");
      navigate("/soins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoin();
  }, [id, token]);

  if (loading) return <p className="p-6 text-gray-500">⏳ Chargement...</p>;
  if (!soin) return null;

  return (
    <motion.div
      className="p-8 min-h-screen bg-transparent backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
      >
        <FaArrowLeft /> Retour
      </button>

      <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/30 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            Détail du soin #{soin.id}
          </h1>
          <button
            onClick={() => navigate(`/soins/modifier/${soin.id}`)}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow hover:scale-105 transition flex items-center gap-2"
          >
            <FaEdit /> Modifier
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-gray-900 dark:text-gray-100">
          <p>
            <span className="font-semibold">Patient :</span> {soin.patient_id}
          </p>
          <p>
            <span className="font-semibold">Type :</span> {soin.type_soin}
          </p>
          <p>
            <span className="font-semibold">Acte :</span> {soin.acte || "—"}
          </p>
          <p>
            <span className="font-semibold">Effectué par :</span> {soin.effectue_par || "—"}
          </p>
          <p className="md:col-span-2">
            <span className="font-semibold">Observations :</span> {soin.observations || "—"}
          </p>
          <p className="md:col-span-2">
            <span className="font-semibold">Date :</span>{" "}
            {soin.date ? new Date(soin.date).toLocaleString() : "—"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SoinDetail;
