import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: number;
  nom: string;
  email: string;
  role: string;
  specialite?: string;
  photo_url?: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data as Profile);
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err);
        setError("Impossible de charger le profil utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Chargement du profil...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Profil Utilisateur</h1>

      <div className="flex items-center mb-6">
        {profile?.photo_url ? (
          <img
            src={profile.photo_url}
            alt="Photo de profil"
            className="w-24 h-24 rounded-full mr-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mr-4">
            <span className="text-2xl text-white font-bold">{profile?.nom?.charAt(0)}</span>
          </div>
        )}
        <div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">{profile?.nom}</p>
          <p className="text-gray-600 dark:text-gray-300">{profile?.email}</p>
          <p className="text-gray-600 dark:text-gray-300 capitalize">Rôle : {profile?.role}</p>
          {profile?.specialite && (
            <p className="text-gray-600 dark:text-gray-300">Spécialité : {profile.specialite}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Retour au Dashboard
      </button>
    </div>
  );
};

export default ProfilePage;
