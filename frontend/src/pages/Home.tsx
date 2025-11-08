import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center items-center p-6">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6 text-center animate-fade-in">
        Bienvenue sur la plateforme IA Santé
      </h1>
      <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl">
        Optimisez la gestion des patients, diagnostics, consultations et dossiers médicaux avec une
        interface moderne et intelligente. Cette solution est conçue pour les médecins, hôpitaux et
        cliniques modernes.
      </p>
      <div className="flex flex-wrap gap-6 justify-center">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all duration-200"
        >
          Connexion
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl shadow hover:bg-blue-50 transition-all duration-200"
        >
          Inscription
        </button>
      </div>
    </div>
  );
};

export default HomePage;
