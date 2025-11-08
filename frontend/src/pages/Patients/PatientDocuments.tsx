import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";

interface Document {
  id: number;
  nom_fichier: string;
  chemin: string;
  date_upload: string;
}

const PatientDocuments = () => {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const { token } = useUser();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token || !patientId) return;

      try {
        const res = await api.get<Document[]>(`/documents/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocuments(res.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des documents :", error);
        toast.error("Impossible de récupérer les documents médicaux.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [patientId, token]);

  return (
    <div className="p-6 min-h-screen bg-transparent text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">📂 Documents médicaux du patient</h1>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-300">Chargement des documents...</p>
      ) : documents.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300">
          Aucun document trouvé pour ce patient.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-white/20 dark:bg-gray-800/40 rounded-2xl 
                         backdrop-blur-lg shadow-xl border border-white/30 
                         hover:bg-white/30 dark:hover:bg-gray-700/60 transition"
            >
              <h2 className="font-semibold mb-2">{doc.nom_fichier}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {new Date(doc.date_upload).toLocaleString()}
              </p>
              <a
                href={doc.chemin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                📄 Voir le document
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDocuments;
