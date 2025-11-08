// frontend/src/pages/Pharmacie/PharmacieDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/uui/ui_card";
import { FaPills, FaUserMd, FaUserShield, FaCalendarAlt, FaTrash, FaEdit } from "react-icons/fa";

interface Pharmacie {
  id: number;
  nom_medicament: string;
  forme: string;
  dosage: string;
  categorie: string;
  quantite_stock: number;
  seuil_alerte: number;
  date_prescription: string;
  date_peremption?: string;
  etat: string;
  medecin?: { nom: string; prenom: string };
  pharmacien?: { nom: string; prenom: string };
  fichier_url?: string;
}

const PharmacieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [pharmacie, setPharmacie] = useState<Pharmacie | null>(null);

  useEffect(() => {
    const fetchPharmacie = async () => {
      try {
        const res = await api.get(`/pharmacie/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPharmacie(res.data);
      } catch (error) {
        toast.error("❌ Erreur lors du chargement du médicament");
        console.error(error);
      }
    };
    fetchPharmacie();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      await api.delete(`/pharmacie/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Médicament supprimé");
      navigate("/pharmacie");
    } catch (error) {
      toast.error("❌ Erreur lors de la suppression");
      console.error(error);
    }
  };

  if (!pharmacie) {
    return <p className="text-center text-gray-500">Chargement...</p>;
  }

  return (
    <motion.div
      className="p-8 bg-transparent text-gray-900 dark:text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl p-6">
        <CardContent>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaPills className="text-pink-500" /> {pharmacie.nom_medicament}
          </h2>
          <p className="text-sm text-gray-400">
            {pharmacie.categorie} • {pharmacie.forme} • {pharmacie.dosage}
          </p>

          {/* Stock */}
          <div className="mt-4">
            <p>
              <strong>Quantité en stock :</strong> {pharmacie.quantite_stock}
            </p>
            <p>
              <strong>Seuil d’alerte :</strong> {pharmacie.seuil_alerte}
            </p>
            <p>
              <strong>État :</strong>{" "}
              <span className="px-2 py-1 bg-purple-500/30 rounded-lg">{pharmacie.etat}</span>
            </p>
          </div>

          {/* Dates */}
          <div className="mt-4 flex gap-6">
            <div className="flex items-center gap-2">
              <FaCalendarAlt />{" "}
              <span>
                Prescrit le : {new Date(pharmacie.date_prescription).toLocaleDateString()}
              </span>
            </div>
            {pharmacie.date_peremption && (
              <div className="flex items-center gap-2">
                <FaCalendarAlt />{" "}
                <span>Péremption : {new Date(pharmacie.date_peremption).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Acteurs */}
          <div className="mt-4">
            {pharmacie.medecin && (
              <p className="flex items-center gap-2">
                <FaUserMd className="text-blue-400" /> Prescrit par : {pharmacie.medecin.prenom}{" "}
                {pharmacie.medecin.nom}
              </p>
            )}
            {pharmacie.pharmacien && (
              <p className="flex items-center gap-2">
                <FaUserShield className="text-green-400" /> Validé par :{" "}
                {pharmacie.pharmacien.prenom} {pharmacie.pharmacien.nom}
              </p>
            )}
          </div>

          {/* Fichier joint */}
          {pharmacie.fichier_url && (
            <div className="mt-4">
              <a
                href={pharmacie.fichier_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                📄 Voir l’ordonnance / rapport
              </a>
            </div>
          )}

          {/* Timeline simple */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">📊 Suivi du médicament</h3>
            <ul className="space-y-2">
              <li>✅ Prescription</li>
              {pharmacie.pharmacien && <li>✅ Validation</li>}
              <li>📦 Stock</li>
              {pharmacie.date_peremption && (
                <li>⚠️ Péremption ({new Date(pharmacie.date_peremption).toLocaleDateString()})</li>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate(`/pharmacie/modifier/${pharmacie.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/80 hover:bg-yellow-600 text-white rounded-lg shadow-lg transition"
            >
              <FaEdit /> Modifier
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg shadow-lg transition"
            >
              <FaTrash /> Supprimer
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PharmacieDetail;
