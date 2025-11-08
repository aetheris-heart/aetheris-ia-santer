import React, { useEffect, useState } from "react";
import axios from "axios";

interface Diagnostic {
  id: number;
  patient_id: number;
  resultat: string;
  date: string;
}

const Diagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const response = await axios.get<Diagnostic[]>("http://localhost:8000/diagnostics/");
        setDiagnostics(response.data); // ✅ Typé et accepté
      } catch (err) {
        console.error("Erreur lors du chargement des diagnostics :", err);
        setError("Impossible de charger les diagnostics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();
  }, []);

  if (loading) return <p className="text-center text-blue-500">Chargement des diagnostics...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Liste des Diagnostics</h1>

      {diagnostics.length === 0 ? (
        <p className="text-gray-500">Aucun diagnostic disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diagnostics.map((diag) => (
            <div key={diag.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-600 mb-2">Diagnostic #{diag.id}</h2>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Patient ID:</strong> {diag.patient_id}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Résultat:</strong> {diag.resultat}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Date:</strong> {new Date(diag.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Diagnostics;
