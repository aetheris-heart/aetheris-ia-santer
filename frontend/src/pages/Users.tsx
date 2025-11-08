import { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash, FaEdit } from "react-icons/fa";

interface User {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  specialite?: string;
  role: string;
}

const Users = () => {
  const { token } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    specialite: "",
  });
  const [loading, setLoading] = useState(false);

  /** Charger tous les médecins (via /admin/users) */
  useEffect(() => {
    if (token) {
      api
        .get<User[]>("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUsers(res.data);
          setFilteredUsers(res.data);
        })
        .catch((err) => {
          console.error("❌ Erreur chargement médecins :", err);
          toast.error("Erreur lors du chargement des médecins");
        });
    }
  }, [token]);

  /** Recherche */
  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u.nom.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  /** Ajouter un médecin (via /auth/register) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nom", newUser.nom);
      formData.append("prenom", newUser.prenom);
      formData.append("email", newUser.email);
      formData.append("password", newUser.password);
      formData.append("specialite", newUser.specialite);

      await api.post("/auth/register", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Médecin ajouté avec succès !");
      setNewUser({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        specialite: "",
      });

      // recharge liste
      const res = await api.get<User[]>("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error("❌ Erreur ajout médecin :", err);
      toast.error("Échec de l’ajout. Vérifiez les champs ou les autorisations.");
    } finally {
      setLoading(false);
    }
  };

  /** Supprimer un médecin */
  const supprimerUser = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("🗑️ Médecin supprimé.");
    } catch (error) {
      console.error("Erreur suppression :", error);
      toast.error("Impossible de supprimer ce médecin.");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">👨‍⚕️ Gestion des Médecins</h1>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher un médecin..."
          className="w-full md:w-1/2 p-3 rounded-lg text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulaire d'ajout */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-semibold mb-4">➕ Ajouter un Médecin</h2>
          <div className="space-y-4">
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={newUser.nom}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-white/10 placeholder-white border border-white/20 focus:outline-none"
            />
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={newUser.prenom}
              onChange={handleChange}
              className="w-full p-3 rounded bg-white/10 placeholder-white border border-white/20 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-white/10 placeholder-white border border-white/20 focus:outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={newUser.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-white/10 placeholder-white border border-white/20 focus:outline-none"
            />
            <input
              type="text"
              name="specialite"
              placeholder="Spécialité"
              value={newUser.specialite}
              onChange={handleChange}
              className="w-full p-3 rounded bg-white/10 placeholder-white border border-white/20 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-cyan-500 hover:bg-cyan-600 px-4 py-3 rounded-xl font-semibold shadow hover:scale-105 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "En cours..." : "Ajouter"}
            </button>
          </div>
        </form>

        {/* Liste des utilisateurs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">👥 Médecins enregistrés</h2>
          {filteredUsers.length === 0 ? (
            <p className="text-gray-400">Aucun médecin trouvé.</p>
          ) : (
            <ul className="space-y-3">
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  className="bg-white/10 border border-white/20 p-4 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-bold">
                      {user.nom} {user.prenom}
                    </p>
                    <p className="text-sm text-gray-300">{user.email}</p>
                    {user.specialite && (
                      <p className="text-sm text-cyan-300">Spécialité : {user.specialite}</p>
                    )}
                  </div>
                  <div className="flex gap-3 text-white">
                    <button
                      onClick={() => toast.info("🔧 Fonction d’édition à venir")}
                      className="hover:text-yellow-400"
                    >
                      <FaEdit />
                    </button>
                    <button onClick={() => supprimerUser(user.id)} className="hover:text-red-500">
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
