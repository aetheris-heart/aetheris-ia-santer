import { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
}

const Patients = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string>("");

  const fetchPatients = async () => {
    if (!token) return;
    try {
      const res = await api.get<Patient[]>("/patients/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
      setError("");
    } catch (err) {
      console.error("Erreur lors du chargement des patients :", err);
      setError("❌ Impossible de charger les patients.");
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen px-6 py-12 bg-transparent text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">👨‍⚕️ Liste des Patients</h1>
          <button
            onClick={() => navigate("/ajouter-patient")}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            ➕ Ajouter un Patient
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {patients.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-300">
            Aucun patient enregistré pour le moment.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => navigate(`/dossiers/${patient.id}`)}
                className="bg-white/20 dark:bg-gray-800/40 p-6 rounded-3xl backdrop-blur-lg shadow-xl border border-white/30 hover:bg-white/30 cursor-pointer transition"
              >
                <h2 className="text-xl font-bold mb-2">
                  {patient.prenom} {patient.nom}
                </h2>
                <p>🧬 Sexe : {patient.sexe}</p>
                <p>
                  🎂 Date de naissance : {new Date(patient.date_naissance).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
