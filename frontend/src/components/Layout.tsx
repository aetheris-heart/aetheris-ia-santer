import React, { useContext, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "@/components/Sidebar";
import ThemeSwitch from "@/components/ThemeSwitch";
import { ThemeContext } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { Sparkles } from "lucide-react";
import { UILoader, UIButton } from "@/components/uui";
import type { Specialite } from "@/types";

const Layout: React.FC = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user, token, loading, setToken, setUser } = useUser();
  const [heure, setHeure] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicPath = ["/register", "/login", "/admin/creer"].includes(location.pathname);

  useEffect(() => {
    const timer = setInterval(() => setHeure(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token && !loading && !isPublicPath) {
      navigate("/login");
    }
  }, [token, loading, location.pathname]);

  if (loading) return <UILoader />;

  // ✅ Corrections
  const nom = user?.nom ?? "Médecin";
  const specialite =
    typeof user?.specialite === "string"
      ? user.specialite
      : ((user?.specialite as unknown as Specialite | null)?.nom ?? "Spécialité inconnue");

  const photoUrl = user?.photo_url ?? "/default-avatar.png";

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen text-gray-900 dark:text-gray-100">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto relative bg-transparent">
        {/* En-tête */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={photoUrl}
              alt="Avatar Médecin"
              className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-md object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Bienvenue, {nom} 👨‍⚕️
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {specialite} • {heure.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString()}
            </span>
            <ThemeSwitch />
            <UIButton onClick={handleLogout} variant="danger" className="text-sm">
              Déconnexion
            </UIButton>
          </div>
        </header>

        {/* Contenu */}
        <section className="p-6 flex-1 bg-transparent">
          <Outlet />
        </section>

        {/* Bouton flottant vers Aetheris */}
        <button
          onClick={() => navigate("/aetheris")}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform"
          title="Accéder à l'IA Aetheris"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </button>
      </main>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Layout;
