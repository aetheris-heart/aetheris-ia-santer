import { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { FaTrash, FaUserMd } from "react-icons/fa";

interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  specialite?: string;
  role: string;
}

const ListeMedecins = () => {
  const { token } = useUser();
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [search, setSearch] = useState("");

  /** Charger tous les médecins */
  useEffect(() => {
    if (token) {
      api
        .get<Medecin[]>("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setMedecins(res.data))
        .catch((err) => {
          console.error("❌ Erreur chargement médecins :", err);
          toast.error("Erreur lors du chargement des médecins");
        });
    }
  }, [token]);

  /** Supprimer un médecin */
  const supprimerMedecin = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedecins((prev) => prev.filter((m) => m.id !== id));
      toast.success("🗑️ Médecin supprimé.");
    } catch (error) {
      console.error("Erreur suppression :", error);
      toast.error("Impossible de supprimer ce médecin.");
    }
  };

  /** Filtrage recherche */
  const filtered = medecins.filter(
    (m) =>
      m.nom.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <FaUserMd className="text-cyan-400" /> Liste des Médecins
      </h1>

      {/* Recherche */}
      <input
        type="text"
        placeholder="🔍 Rechercher..."
        className="w-full md:w-1/2 p-3 rounded-lg mb-6 text-black"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="text-gray-400">Aucun médecin trouvé.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => (
            <li
              key={m.id}
              className="bg-white/10 border border-white/20 p-4 rounded-xl flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-bold">
                  {m.nom} {m.prenom}
                </p>
                <p className="text-sm text-gray-300">{m.email}</p>
                {m.specialite && (
                  <p className="text-sm text-cyan-300">Spécialité : {m.specialite}</p>
                )}
              </div>
             <button
  onClick={() => supprimerMedecin(m.id)}
  aria-label={`Supprimer le médecin ${m.nom} ${m.prenom}`} // ✅ nom lisible pour lecteurs d’écran
  title="Supprimer le médecin" // ✅ infobulle visible + nom accessible
  className="text-red-500 hover:text-red-700 transition transform hover:scale-110"
>
  <FaTrash className="w-5 h-5" aria-hidden="true" />
</button>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListeMedecins;
