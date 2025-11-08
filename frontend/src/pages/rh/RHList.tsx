import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaUserTie, FaSearch } from "react-icons/fa";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import type { RH } from "@/types";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const RHList: React.FC = () => {
  const [data, setData] = useState<RH[]>([]);
  const [filters, setFilters] = useState({
    nom: "",
    poste: "",
    service: "",
    type_contrat: "",
    statut: "",
  });
  const { token } = useUser();
  const navigate = useNavigate();

  async function fetchRH() {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""));

      const res = await api.get("/rh", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setData(res.data as RH[]);
    } catch (err) {
      console.error("Erreur chargement RH :", err);
      toast.error("❌ Erreur lors du chargement des employés RH");
    }
  }

  useEffect(() => {
    if (token) fetchRH();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRH();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          👥 Gestion des Ressources Humaines
        </h1>
        <button
          onClick={() => navigate("/rh/ajouter")}
          className="flex items-center gap-2 px-5 py-2 bg-yellow-500 text-black rounded-lg font-semibold shadow-lg hover:bg-yellow-400 transition"
        >
          <FaPlus /> Ajouter RH
        </button>
      </div>

      {/* 🔎 Filtres avancés */}
      <form
        onSubmit={handleSearch}
        className="mb-8 bg-gray-900/70 p-4 rounded-xl border border-yellow-600 grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <label htmlFor="nom" className="sr-only">
          Filtrer par nom
        </label>
        <input
          id="nom"
          type="text"
          name="nom"
          placeholder="Nom"
          value={filters.nom}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white border border-gray-700"
        />

        <label htmlFor="poste" className="sr-only">
          Filtrer par poste
        </label>
        <input
          id="poste"
          type="text"
          name="poste"
          placeholder="Poste"
          value={filters.poste}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white border border-gray-700"
        />

        <label htmlFor="service" className="sr-only">
          Filtrer par service
        </label>
        <input
          id="service"
          type="text"
          name="service"
          placeholder="Service"
          value={filters.service}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white border border-gray-700"
        />

        <label htmlFor="type_contrat" className="sr-only">
          Filtrer par type de contrat
        </label>
        <select
          id="type_contrat"
          name="type_contrat"
          value={filters.type_contrat}
          onChange={handleChange}
          aria-label="Filtrer par type de contrat"
          className="p-2 rounded bg-gray-800 text-white border border-gray-700"
        >
          <option value="">Tous Contrats</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Stage">Stage</option>
          <option value="Interim">Intérim</option>
        </select>

        <label htmlFor="statut" className="sr-only">
          Filtrer par statut
        </label>
        <select
          id="statut"
          name="statut"
          value={filters.statut}
          onChange={handleChange}
          aria-label="Filtrer par statut"
          className="p-2 rounded bg-gray-800 text-white border border-gray-700"
        >
          <option value="">Tous Statuts</option>
          <option value="actif">Actif</option>
          <option value="congé">En congé</option>
          <option value="démissionné">Démissionné</option>
        </select>

        <button
          type="submit"
          className="col-span-1 md:col-span-5 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
        >
          <FaSearch /> Rechercher
        </button>
      </form>

      {/* Liste des RH */}
      {data.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">Aucun membre RH trouvé pour ces critères.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((rh, index) => (
            <motion.div
              key={rh.id}
              className="bg-gray-900/70 border border-yellow-600 rounded-2xl p-6 cursor-pointer hover:shadow-2xl hover:border-yellow-400 transition"
              onClick={() => navigate(`/rh/${rh.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-4">
                <FaUserTie className="text-yellow-500 text-3xl" />
                <div>
                  <p className="font-bold text-lg">
                    {rh.nom} {rh.prenom}
                  </p>
                  <p className="text-gray-400 text-sm">{rh.poste}</p>
                  <p className="text-gray-500 text-xs">{rh.email}</p>
                  <p className="text-gray-500 text-xs italic">{rh.service || "Non assigné"}</p>
                  <p className="text-gray-400 text-xs">
                    Contrat : {rh.type_contrat} | Statut : {rh.statut}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RHList;
