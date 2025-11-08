import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <p className="text-xl mt-4 text-gray-700 dark:text-gray-300">
        Oups ! La page que vous cherchez n'existe pas.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        🔙 Retour à l'accueil
      </button>
    </div>
  );
};

export default NotFound;
