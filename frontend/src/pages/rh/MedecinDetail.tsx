import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserMd, FaEnvelope, FaPhone, FaHospital, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

interface Medecin {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  specialite?: string;
  hopital?: string;
  photo_url?: string;
  role?: string;
  statut?: string;
  bio?: string;
}

const MedecinDetail: React.FC = () => {
  const { token } = useUser();
  const { id } = useParams<{ id: string }>();
  const [medecin, setMedecin] = useState<Medecin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const res = await api.get<Medecin[]>(`/rh/medecins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const found = res.data.find((m) => m.id === Number(id));
        if (!found) throw new Error("Médecin introuvable");
        setMedecin(found);
      } catch (err) {
        console.error("Erreur chargement médecin :", err);
        toast.error("❌ Impossible de charger le profil du médecin.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMedecin();
  }, [id, token]);

  if (loading) {
    return <p className="text-center text-gray-500 mt-20">Chargement du profil...</p>;
  }

  if (!medecin) {
    return <p className="text-center text-red-600 mt-20">Médecin introuvable</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-indigo-100 p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-2xl p-8"
      >
        <Link
          to="/rh/medecins"
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-semibold"
        >
          <FaArrowLeft className="mr-2" /> Retour à la liste
        </Link>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <img
            src={medecin.photo_url || "/assets/default_doctor.png"}
            alt={`Dr ${medecin.nom}`}
            className="w-48 h-48 rounded-full object-cover border-4 border-indigo-400 shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-indigo-700 mb-2">
              Dr {medecin.prenom} {medecin.nom}
            </h1>
            <p className="text-gray-700 text-lg mb-2 italic">
              {medecin.specialite || "Spécialité non précisée"}
            </p>
            <p className="text-gray-600">
              <FaHospital className="inline mr-2 text-indigo-500" />
              {medecin.hopital || "Hôpital non renseigné"}
            </p>
            <p className="mt-2 text-gray-600">
              <FaEnvelope className="inline mr-2 text-indigo-500" />
              {medecin.email}
            </p>
            {medecin.telephone && (
              <p className="mt-1 text-gray-600">
                <FaPhone className="inline mr-2 text-green-500" />
                {medecin.telephone}
              </p>
            )}
            <div className="mt-3 text-gray-700">
              <p>
                👔 <b>Rôle :</b> {medecin.role}
              </p>
              <p>
                ✅ <b>Statut :</b> {medecin.statut}
              </p>
            </div>
          </div>
        </div>

        {medecin.bio && (
          <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-inner">
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">Biographie</h2>
            <p className="text-gray-700 leading-relaxed">{medecin.bio}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MedecinDetail;
