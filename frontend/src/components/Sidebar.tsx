import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  AlertTriangle,
  ActivitySquare,
  ClipboardList,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Activity,
  Layers,
  UploadCloud,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaStethoscope,
  FaFileMedical,
  FaPlusCircle,
  FaListUl,
  FaExclamationTriangle,
  FaPills,
  FaFlask,
  FaAmbulance,
  FaHospital,
  FaUserNurse,
  FaUserPlus,
  FaUserShield,
  FaCalendarCheck,
  FaImages,
  FaBolt,
} from "react-icons/fa";

import { useUser } from "@/context/UserContext";
import { AnimatePresence, motion } from "framer-motion";

const Sidebar: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // États pour les sous-menus
  const [openSpecialites, setOpenSpecialites] = useState(false);
  const [openAetheris, setOpenAetheris] = useState(false);
  const [openModulesMedicaux, setOpenModulesMedicaux] = useState(false);
  const [openImagerie, setOpenImagerie] = useState(false);
  const [openBlocOperatoire, setOpenBlocOperatoire] = useState(false);
  const [openUrgence, setOpenUrgence] = useState(false);
  const [openAmbulance, setOpenAmbulance] = useState(false);
  const [openVisualIA, setOpenVisualIA] = useState(false);

  // 🏥 Modules principaux
  const modules = [
    { path: "/dashboard", label: "Dashboard", icon: <FaHome className="text-indigo-400" /> },
    {
      path: "/patients-liste",
      label: "Liste Patients",
      icon: <FaListUl className="text-cyan-400" />,
    },
    {
      path: "/ajouter-patient",
      label: "Ajouter Patient",
      icon: <FaPlusCircle className="text-green-400" />,
    },
    {
      path: "/patients-critiques",
      label: "Patients Critiques",
      icon: <FaExclamationTriangle className="text-red-500" />,
    },
    {
      path: "/dossiers",
      label: "Dossiers Médicaux",
      icon: <FaFileMedical className="text-blue-500" />,
    },
    {
      path: "/consultations",
      label: "Consultations",
      icon: <FaStethoscope className="text-purple-500" />,
    },
    {
      path: "/rendezvous",
      label: "Rendez-vous",
      icon: <FaCalendarCheck className="text-yellow-500" />,
    },
    {
      path: "/hospitalisations",
      label: "Hospitalisations",
      icon: <FaHospital className="text-indigo-500" />,
    },
    { path: "/soins", label: "Soins Infirmiers", icon: <FaUserNurse className="text-sky-400" /> },
    {
      path: "/biologie",
      label: "Analyses Biologiques",
      icon: <FaFlask className="text-green-500" />,
    },
    { path: "/pharmacie", label: "Pharmacie", icon: <FaPills className="text-indigo-500" /> },
  ];

  return (
    <aside className="w-full md:w-64 min-h-screen flex flex-col justify-between p-4 text-gray-900 dark:text-gray-100 bg-transparent">
      <div className="flex flex-col h-full justify-between">
        {/* 🧠 LOGO */}
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text tracking-wide animate-pulse">
          AETHERIS IA
        </h1>

        {/* 📦 MODULES HOSPITALIERS */}
        <div className="mt-2 space-y-1 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 px-2 tracking-widest">
            Modules Hospitaliers
          </h3>

          {modules.map((mod) => (
            <NavLink
              key={mod.path}
              to={mod.path}
              end
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105"
                    : "text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-white/30 hover:shadow-lg"
                }`
              }
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{mod.icon}</span>
                {mod.label}
              </span>
            </NavLink>
          ))}

          {/* 🏥 Bloc opératoire */}
          <div className="mt-4">
            <button
              onClick={() => setOpenBlocOperatoire(!openBlocOperatoire)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition"
            >
              <span className="flex items-center gap-2">🏥 Bloc opératoire</span>
              {openBlocOperatoire ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {openBlocOperatoire && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  <NavLink
                    to="/bloc-operatoire"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    📋 Tableau de bord
                  </NavLink>

                  <NavLink
                    to="/bloc-operatoire/ajouter"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    ➕ Ajouter une intervention
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 📸 Imagerie & Radiologie */}
          <div className="mt-4">
            <button
              onClick={() => setOpenImagerie(!openImagerie)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition"
            >
              <span className="flex items-center gap-2">
                <FaImages className="text-pink-500" />
                Imagerie & Radiologie
              </span>
              {openImagerie ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {openImagerie && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  <NavLink
                    to="/imageries"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    🩻 Imagerie Médicale
                  </NavLink>
                  <NavLink
                    to="/radiologie"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    ⚡ Radiologie IA
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🧠 Synthèse IA */}
          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2 ml-4">
              Intelligence Aetheris
            </h3>

            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/synthese"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/10 hover:text-teal-400"
                    }`
                  }
                >
                  <Brain className="w-5 h-5" />
                  <span>Synthèse IA</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/synthese/alertes"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/10 hover:text-red-400"
                    }`
                  }
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span>Alertes IA</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/synthese/anomalies"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/10 hover:text-indigo-400"
                    }`
                  }
                >
                  <ActivitySquare className="w-5 h-5" />
                  <span>Anomalies IA</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/synthese/recommandations"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/10 hover:text-green-400"
                    }`
                  }
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>Recommandations IA</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* 🧠 VISUAL IA (AETHERIS VISUELLE) */}
          <div className="mt-4">
            <button
              onClick={() => setOpenVisualIA(!openVisualIA)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium text-cyan-400 hover:bg-white/20 transition"
            >
              <span className="flex items-center gap-2">
                <Brain className="text-cyan-400 w-5 h-5" />
                Visual IA
              </span>
              {openVisualIA ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {openVisualIA && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  <NavLink
                    to="/ia-visual/dashboard"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/20 flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4 text-cyan-300" /> Tableau IA
                  </NavLink>
                  <NavLink
                    to="/ia-visual/nouvelle"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/20 flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4 text-cyan-300" /> Nouvelle Analyse
                  </NavLink>
                  <NavLink
                    to="/ia-visual/historique"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/20 flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-cyan-300" /> Historique
                  </NavLink>
                  <NavLink
                    to="/visual-ia/settings"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/20 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-cyan-300" /> Réglages IA
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🚨 URGENCES */}
          <div className="mt-4">
            <button
              onClick={() => setOpenUrgence(!openUrgence)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition"
            >
              <span className="flex items-center gap-2">
                <FaBolt className="text-red-500" />
                Urgences
              </span>
              {openUrgence ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {openUrgence && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  <NavLink
                    to="/urgences/dashboard"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30 font-semibold text-red-400"
                  >
                    📊 Dashboard Urgences IA
                  </NavLink>

                  <NavLink
                    to="/urgences"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    🚨 Liste des urgences
                  </NavLink>

                  <NavLink
                    to="/urgences/ajouter"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    ➕ Ajouter une urgence
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🚑 AMBULANCE */}
          <div className="mt-4">
            <button
              onClick={() => setOpenAmbulance(!openAmbulance)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition"
            >
              <span className="flex items-center gap-2">
                <FaAmbulance className="text-emerald-500" />
                Ambulance
              </span>
              {openAmbulance ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {openAmbulance && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  <NavLink
                    to="/ambulances"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    🚑 Liste Ambulances
                  </NavLink>
                  <NavLink
                    to="/ambulances/ajouter"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    ➕ Ajouter Ambulance
                  </NavLink>
                  <NavLink
                    to="/ambulances-map"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    🗺️ Dashboard Ambulance
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ✦ IA AETHERIS */}
          <div className="mt-6">
            <button
              onClick={() => setOpenAetheris(!openAetheris)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-bold text-purple-700 dark:text-purple-300 hover:bg-white/30 transition"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                AETHERIS IA
              </span>
              {openAetheris ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {openAetheris && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  <NavLink
                    to="/aetheris"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    ⚙️ Interface IA
                  </NavLink>
                  <NavLink
                    to="/aetheris/predictive"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    🔮 Détection Prédictive
                  </NavLink>
                  <NavLink
                    to="/aetheris/monitoring"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    🧩 Surveillance Continue
                  </NavLink>
                  <NavLink
                    to="/aetheris/reactive"
                    className="block px-3 py-1.5 rounded-lg text-sm hover:bg-white/30"
                  >
                    ⚡ Réponse Instantanée
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 👑 ADMIN */}
          {user?.role === "admin" && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:scale-105 hover:shadow-lg transition-all"
              >
                <FaUserShield className="text-black" />
                Admin Dashboard
              </button>
              <button
                onClick={() => navigate("/admin/creer")}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-green-400 to-green-600 text-black hover:scale-105 hover:shadow-lg transition-all"
              >
                <FaUserPlus className="text-black" />
                Créer Admin
              </button>
            </div>
          )}
        </div>

        {/* ✦ Signature */}
        <div className="mt-8 text-center space-y-2">
          <div className="w-32 h-1 mx-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-extrabold tracking-widest bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text animate-pulse">
            ✦ AETHERIS ✦
          </h2>
          <p className="text-[10px] text-gray-800 dark:text-gray-300 italic">
            L’empreinte Royale de l’IA Médicale
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Aetheris Health Initiative
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
