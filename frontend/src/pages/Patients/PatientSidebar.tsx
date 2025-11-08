import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartPulse, Brain, Stethoscope, Droplet, Flame, Activity } from "lucide-react";

interface PatientSidebarProps {
  patientId: number;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({ patientId, isOpen, toggleSidebar }) => {
  return (
    <motion.div
      animate={{ width: isOpen ? 260 : 60 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-indigo-800 to-purple-900 text-white h-screen shadow-2xl flex flex-col"
    >
      {/* Bouton d'ouverture/fermeture */}
      <div className="p-4 flex justify-between items-center">
        {isOpen && <h2 className="text-xl font-bold">Fonctions Patient</h2>}
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          {isOpen ? "⏪" : "⏩"}
        </button>
      </div>

      {/* Liens fonctionnels */}
      <nav className="flex flex-col gap-4 p-4">
        <Link
          to={`/patients/${patientId}/cardiaque`}
          className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-xl"
        >
          <HeartPulse /> {isOpen && <span>Fonction Cardiaque</span>}
        </Link>
        <Link
          to={`/patients/${patientId}/neurologique`}
          className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-xl"
        >
          <Brain /> {isOpen && <span>Fonction Neurologique</span>}
        </Link>
        <Link
          to={`/patients/${patientId}/pulmonaire`}
          className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-xl"
        >
          <Stethoscope /> {isOpen && <span>Fonction Pulmonaire</span>}
        </Link>
        <Link
          to={`/patients/${patientId}/renale`}
          className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-xl"
        >
          <Droplet /> {isOpen && <span>Fonction Rénale</span>}
        </Link>
        <Link
          to={`/patients/${patientId}/metabolique`}
          className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-xl"
        >
          <Flame /> {isOpen && <span>Fonction Métabolique</span>}
        </Link>
        <Link
          to={`/patients/${patientId}/digestive`}
          className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-xl"
        >
          <Activity /> {isOpen && <span>Fonction Digestive</span>}
        </Link>
      </nav>
    </motion.div>
  );
};

export default PatientSidebar;
