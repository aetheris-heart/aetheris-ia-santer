import React, { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  sexe: string;
  telephone?: string;
  adresse?: string;
  email?: string;
  groupe_sanguin?: string;
  allergies?: string;
  antecedents?: string;
}

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { token } = useUser();

  useEffect(() => {
    const fetchPatients = async () => {
      if (!token) return;

      try {
        const response = await api.get<Patient[]>("/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(response.data);
        setError("");
      } catch (error) {
        console.error("Erreur lors du chargement des patients :", error);
        setError("❌ Impossible de charger les patients.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPatients();
  }, [token]);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 text-gray-900 dark:text-white">
      <h1 className="text-4xl font-extrabold mb-10 text-center drop-shadow-lg">
        📋 Liste Complète des Patients
      </h1>

      {error && <p className="text-red-500 font-semibold text-sm mb-4 text-center">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300">Chargement...</p>
      ) : patients.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">Aucun patient trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {patients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/dossiers/${patient.id}`)}
              className="p-6 rounded-3xl bg-white/60 dark:bg-gray-800/30 backdrop-blur-lg 
                         border border-white/40 shadow-xl cursor-pointer 
                         hover:scale-105 hover:bg-white/80 dark:hover:bg-gray-700/60 
                         transition-all"
            >
              <h2 className="text-2xl font-semibold mb-2">
                {patient.prenom} {patient.nom}
              </h2>
              <p className="text-sm opacity-90">🧬 Âge : {patient.age} ans</p>
              <p className="text-sm opacity-90">🚻 Sexe : {patient.sexe}</p>
              {patient.groupe_sanguin && (
                <p className="text-sm opacity-90">🩸 Groupe : {patient.groupe_sanguin}</p>
              )}
              {patient.telephone && <p className="text-sm opacity-90">📞 {patient.telephone}</p>}
              {patient.email && <p className="text-sm opacity-90">📧 {patient.email}</p>}
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/ajouter-patient")}
          className="px-8 py-3 bg-indigo-600/80 hover:bg-indigo-700/90 
                     text-white text-lg rounded-2xl font-semibold 
                     shadow-lg backdrop-blur-md transition"
        >
          ➕ Ajouter un patient
        </motion.button>
      </div>
    </div>
  );
};

export default PatientList;
