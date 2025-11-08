import React, { useContext, useEffect, useRef } from "react";

import { ThemeContext, type ThemeContextType } from "@/context/ThemeContext"; // ← type uniquement (facultatif si pas utilisé)

import { Sun, Moon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const ThemeSwitch: React.FC = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext) as ThemeContextType;
  const hasInteracted = useRef(false);

  useEffect(() => {
    const playSoundAndNotify = () => {
      const sound = new Audio("/sounds/switch.mp3");
      sound.volume = 0.3;

      sound
        .play()
        .then(() => {
          toast(
            darkMode
              ? "🌙 Mode Sombre Aetheris désactivé. Champs photoniques stabilisés."
              : "🌞 Mode Sombre Aetheris activé. Optimisation visuelle engagée.",
            {
              position: "top-right",
              autoClose: 3500,
              theme: darkMode ? "light" : "dark",
            }
          );
        })
        .catch(() => {
          console.warn("🔇 Son non autorisé sans interaction utilisateur.");
        });
    };

    if (hasInteracted.current) {
      playSoundAndNotify();
    }

    const handleUserInteraction = () => {
      hasInteracted.current = true;
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [darkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className={`relative w-16 h-9 rounded-full transition-all duration-500
        shadow-inner border border-cyan-400
        ${darkMode ? "bg-gradient-to-r from-[#0f172a] to-[#0e7490]" : "bg-gradient-to-r from-yellow-300 to-yellow-500"}`}
    >
      <motion.div
        layout
        className="absolute w-7 h-7 rounded-full shadow-lg flex items-center justify-center"
        initial={false}
        animate={{
          x: darkMode ? 36 : 2,
          backgroundColor: darkMode ? "#1e293b" : "#fff",
          color: darkMode ? "#67e8f9" : "#facc15",
        }}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {darkMode ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={18} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={18} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <Sparkles
        className="absolute top-1 left-1 text-cyan-200 opacity-40 animate-pulse pointer-events-none"
        size={14}
      />
    </button>
  );
};

export default ThemeSwitch;
