import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";

interface User {
  id: number;
  nom: string;
  email: string;
  specialite?: string;
  role?: string;
  photo_url?: string | null;
}

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const response = await api.get<User>(`/auth/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("❌ Erreur lors du chargement de l’utilisateur :", error);
        setErreur("Impossible de charger les informations de l'utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p className="text-center text-gray-400">⏳ Chargement des données...</p>;
  if (erreur) return <p className="text-center text-red-500">{erreur}</p>;
  if (!user) return <p className="text-center text-gray-400">Utilisateur non trouvé.</p>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Profil de l'utilisateur</h1>

      <div className="flex items-center space-x-6 mb-6">
        {user.photo_url && (
          <img
            src={user.photo_url}
            alt={user.nom}
            className="w-28 h-28 rounded-full shadow-lg object-cover border border-white/20"
          />
        )}
        <div className="text-gray-100 space-y-2">
          <p>
            <strong>Nom :</strong> {user.nom}
          </p>
          <p>
            <strong>Email :</strong> {user.email}
          </p>
          {user.specialite && (
            <p>
              <strong>Spécialité :</strong> {user.specialite}
            </p>
          )}
          {user.role && (
            <p>
              <strong>Rôle :</strong> {user.role}
            </p>
          )}
        </div>
      </div>

      {/* ✅ Bouton retour */}
      <div className="mt-6">
        <button
          onClick={() => navigate("/users")}
          className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-md transition"
        >
          ⬅️ Retour à la liste des médecins
        </button>
      </div>
    </div>
  );
};

export default UserDetail;
