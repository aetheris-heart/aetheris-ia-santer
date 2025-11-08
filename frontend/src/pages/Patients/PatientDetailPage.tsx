import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import {
  FaHeartbeat,
  FaBrain,
  FaLungs,
  FaTint,
  FaFlask,
  FaFileMedical,
  FaDownload,
  FaArrowLeft,
  FaMicroscope,
} from "react-icons/fa";
import { GiStomach } from "react-icons/gi";
import { Card, CardContent } from "@/components/uui";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PatientSidebar from "./PatientSidebar"; // ✅ intégration sidebar

interface DossierPatient {
  id: number;
  nom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
  temperature: number;
  mbp: number;
  rythme_cardiaque: number;
  spo2: number;
}

const PatientDetailPage: React.FC = () => {
  const { token } = useUser();
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<DossierPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const response = await api.get<DossierPatient>(`/patients/${patientId}/dossier`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDossier(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement du dossier patient:", error);
        toast.error("Impossible de charger le dossier du patient.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDossier();
  }, [patientId, token]);

  const handleExportPDF = async () => {
    try {
      const response = await api.get<Blob>(`/patients/${patientId}/export-pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Patient_${dossier?.nom}_${dossier?.prenom}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de l'export du PDF.");
    }
  };

  if (loading) return <div className="text-center p-4">Chargement du dossier patient...</div>;
  if (!dossier) return <div className="text-center p-4">Aucune donnée trouvée.</div>;

  return (
    <div className="flex min-h-screen bg-transparent text-gray-900 dark:text-white">
      {/* Sidebar Patient */}
      <PatientSidebar
        patientId={Number(patientId)}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Contenu principal */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">🩺 Dossier Médical du Patient</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleExportPDF}
            className="flex items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition"
          >
            <FaDownload className="mr-2" /> Exporter PDF
          </motion.button>
        </div>

        {/* Cartes fonctions médicales */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {renderCard(
            "Fonction Cardiaque",
            <FaHeartbeat className="text-red-600 text-4xl mb-2" />,
            `/patients/${patientId}/cardiaque`
          )}
          {renderCard(
            "Fonction Neurologique",
            <FaBrain className="text-purple-500 text-4xl mb-2" />,
            `/patients/${patientId}/neurologique`
          )}
          {renderCard(
            "Fonction Pulmonaire",
            <FaLungs className="text-blue-500 text-4xl mb-2" />,
            `/patients/${patientId}/pulmonaire`
          )}
          {renderCard(
            "Fonction Rénale",
            <FaTint className="text-blue-600 text-4xl mb-2" />,
            `/patients/${patientId}/renale`
          )}
          {renderCard(
            "Fonction Métabolique",
            <FaFlask className="text-green-500 text-4xl mb-2" />,
            `/patients/${patientId}/metabolique`
          )}
          {renderCard(
            "Fonction Digestive",
            <GiStomach className="text-yellow-500 text-4xl mb-2" />,
            `/patients/${patientId}/digestive`
          )}
        </div>

        {/* Infos patient */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-xl bg-white/50 dark:bg-gray-800/70 backdrop-blur-lg border border-white/30">
            <CardContent>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FaFileMedical className="mr-2" /> Données Cliniques
              </h2>
              <p>
                <strong>🌡 Température:</strong> {dossier.temperature} °C
              </p>
              <p>
                <strong>🩺 MBP:</strong> {dossier.mbp} mmHg
              </p>
              <p>
                <strong>❤️ Rythme cardiaque:</strong> {dossier.rythme_cardiaque} bpm
              </p>
              <p>
                <strong>O₂ Saturation:</strong> {dossier.spo2} %
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/50 dark:bg-gray-800/70 backdrop-blur-lg border border-white/30">
            <CardContent>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FaFileMedical className="mr-2" /> Infos Patient
              </h2>
              <p>
                <strong>Nom:</strong> {dossier.nom}
              </p>
              <p>
                <strong>Prénom:</strong> {dossier.prenom}
              </p>
              <p>
                <strong>Sexe:</strong> {dossier.sexe}
              </p>
              <p>
                <strong>Date de naissance:</strong> {dossier.date_naissance}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex justify-between items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="flex items-center bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
          >
            <FaArrowLeft className="mr-2" /> Retour
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/aetheris/analysis-or-generate/${patientId}`)}
            className="flex items-center bg-gradient-to-r from-indigo-500 to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition"
          >
            <FaMicroscope className="mr-3" /> Analyse IA Aetheris
          </motion.button>
        </div>
      </div>
    </div>
  );

  function renderCard(title: string, icon: React.ReactNode, route: string) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Card
          onClick={() => navigate(route)}
          className="cursor-pointer shadow-xl bg-white/50 dark:bg-gray-800/70 backdrop-blur-lg border border-white/30"
        >
          <CardContent className="flex items-center justify-center flex-col">
            {icon}
            <span className="mt-2 font-medium">{title}</span>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
};

export default PatientDetailPage;
