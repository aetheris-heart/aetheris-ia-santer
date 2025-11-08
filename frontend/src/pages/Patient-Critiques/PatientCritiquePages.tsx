import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";

interface PatientCritique {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  sexe: string;
  spo2: number;
  rythme_cardiaque: number;
  temperature: number;
  risk_score: number;
  critere_cardiaque?: string;
  critere_spo2?: string;
  critere_temp?: string;
}

const PatientsCritiquesPage: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientCritique[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!token) return;
      try {
        const response = await api.get<PatientCritique[]>("/dashboard/patients-critiques", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(response.data);
      } catch (err) {
        console.error("Erreur patients critiques :", err);
        toast.error("❌ Impossible de charger les patients critiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [token]);

  return (
    <div className="p-6 min-h-screen bg-transparent">
      <h1 className="text-3xl font-bold mb-8 text-center text-red-700 dark:text-red-400">
        🚨 Patients en état critique
      </h1>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          ⏳ Chargement des patients critiques...
        </p>
      ) : patients.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Aucun patient critique détecté.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white/50 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-red-400/40 hover:scale-105 transition cursor-pointer backdrop-blur-md"
              onClick={() => navigate(`/patients-critiques/${patient.id}`)}
            >
              <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
                {patient.prenom} {patient.nom}
              </h2>
              <p>🧬 Âge : {patient.age}</p>
              <p>🚻 Sexe : {patient.sexe}</p>
              <p>
                💓 Rythme cardiaque : {patient.rythme_cardiaque} bpm{" "}
                {patient.critere_cardiaque && (
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    🚨 {patient.critere_cardiaque}
                  </span>
                )}
              </p>
              <p>
                🩸 Saturation O₂ : {patient.spo2}%{" "}
                {patient.critere_spo2 && (
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    🚨 {patient.critere_spo2}
                  </span>
                )}
              </p>
              <p>
                🌡️ Température : {patient.temperature} °C{" "}
                {patient.critere_temp && (
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    🚨 {patient.critere_temp}
                  </span>
                )}
              </p>
              <p>
                🧮 Score de risque :{" "}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {patient.risk_score}%
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientsCritiquesPage;
