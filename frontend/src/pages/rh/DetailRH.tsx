import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import type { RH } from "@/types";
import {
  FaArrowLeft,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaBuilding,
  FaMoneyBill,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const DetailRH: React.FC = () => {
  const { token } = useUser();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rh, setRH] = useState<RH | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchRH() {
    try {
      const res = await api.get(`/rh/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200 && res.data) {
        setRH(res.data as RH);
      }
    } catch (error) {
      console.error("Erreur chargement RH:", error);
      toast.error("❌ Erreur lors du chargement de l'employé RH");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id && token) fetchRH();
  }, [id, token]);

  async function supprimerRH() {
    if (!id) return;
    if (!window.confirm("⚠️ Voulez-vous vraiment supprimer cet employé ?")) return;

    try {
      await api.delete(`/rh/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Employé supprimé avec succès");
      navigate("/rh");
    } catch (error) {
      console.error("Erreur suppression RH:", error);
      toast.error("❌ Impossible de supprimer l'employé RH");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-yellow-500 text-xl">
        🔄 Chargement des données RH...
      </div>
    );
  }

  if (!rh) {
    return (
      <div className="p-6 text-center text-red-500">❌ Impossible de charger les données RH.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 text-white">
      {/* Retour */}
      <button
        onClick={() => navigate("/rh")}
        className="flex items-center mb-6 text-yellow-500 hover:underline"
      >
        <FaArrowLeft className="mr-2" /> Retour à la liste RH
      </button>

      {/* Carte détaillée */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/70 border border-yellow-600 shadow-2xl rounded-2xl p-8"
      >
        <div className="flex items-center mb-6">
          <FaUserTie className="text-5xl text-yellow-500 mr-4" />
          <div>
            <h2 className="text-3xl font-bold">
              {rh.nom} {rh.prenom}
            </h2>
            <p className="text-sm text-gray-400">{rh.poste}</p>
          </div>
        </div>

        <div className="space-y-3 text-gray-300">
          <p className="flex items-center">
            <FaEnvelope className="mr-2 text-yellow-500" /> {rh.email}
          </p>
          <p className="flex items-center">
            <FaPhone className="mr-2 text-yellow-500" /> {rh.telephone}
          </p>
          <p className="flex items-center">
            <FaBriefcase className="mr-2 text-yellow-500" /> Poste : {rh.poste}
          </p>
          <p className="flex items-center">
            <FaBuilding className="mr-2 text-yellow-500" /> Service : {rh.service || "Non assigné"}
          </p>
          <p className="flex items-center">
            <FaMoneyBill className="mr-2 text-yellow-500" /> Salaire :{" "}
            {rh.salaire ? `${rh.salaire} €` : "Non défini"}
          </p>
          <p className="text-sm italic text-gray-500">Statut : {rh.statut || "actif"}</p>
        </div>

        {/* Boutons actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate(`/rh/${rh.id}/modifier`)} // ✅ corrigé
            className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-400 transition"
          >
            <FaEdit /> Modifier
          </button>
          <button
            onClick={supprimerRH}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition"
          >
            <FaTrash /> Supprimer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DetailRH;
