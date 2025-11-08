import React, { useEffect, useState } from "react";
import { FaSignOutAlt, FaUserMd, FaClock } from "react-icons/fa";

const Topbar: React.FC = () => {
  const [time, setTime] = useState<string>(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-6 py-4 
      bg-white/70 dark:bg-gray-800/70 backdrop-blur-md 
      shadow-md rounded-xl mb-6 border border-gray-200 dark:border-gray-700"
    >
      {/* Heure actuelle */}
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
        <FaClock className="text-indigo-500" />
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
          {time}
        </span>
      </div>

      {/* Profil & Déconnexion */}
      <div className="flex items-center gap-6">
        {/* Profil médecin */}
        <div className="flex items-center gap-2">
          <FaUserMd className="text-blue-500 text-xl" />
          <span className="font-semibold text-gray-800 dark:text-gray-100">Dr. Ateba Ramses</span>
        </div>

        {/* Bouton déconnexion */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg 
          text-red-500 hover:text-white hover:bg-red-600 
          transition-all duration-300 shadow-sm"
        >
          <FaSignOutAlt />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
