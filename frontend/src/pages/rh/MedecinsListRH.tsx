import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserMd,
  FaEnvelope,
  FaHospital,
  FaPhone,
  FaSearch,
  FaFilePdf,
  FaFilter,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom"; // ✅ import navigation

interface Medecin {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  specialite?: string;
  hopital?: string;
  photo_url?: string;
  role?: string;
  statut?: string;
  bio?: string;
}

const MedecinsListRH: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate(); // ✅ hook navigation
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [filtered, setFiltered] = useState<Medecin[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"specialite" | "hopital" | "statut">("specialite");
  const [loading, setLoading] = useState(true);

  // ✅ Charger les médecins (fusion RH + table medecins)
  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        const res = await api.get<Medecin[]>("/rh/medecins", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!Array.isArray(res.data)) throw new Error("Format inattendu");
        setMedecins(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Erreur chargement médecins :", err);
        toast.error("❌ Impossible de charger la liste des médecins.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMedecins();
  }, [token]);

  // 🔍 Recherche et tri dynamique
  useEffect(() => {
    let list = [...medecins];
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.nom?.toLowerCase().includes(lower) ||
          m.prenom?.toLowerCase().includes(lower) ||
          m.email?.toLowerCase().includes(lower) ||
          (m.specialite || "").toLowerCase().includes(lower)
      );
    }
    list.sort((a, b) => (a[sortKey] || "").localeCompare(b[sortKey] || ""));
    setFiltered(list);
  }, [search, sortKey, medecins]);

  const handleExportPDF = async () => {
    try {
      const res = await api.get("/pdf/medecins/export-all", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Liste_Medecins_Aetheris.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("📄 Export PDF généré avec succès !");
    } catch (err) {
      console.error("Erreur export PDF :", err);
      toast.error("❌ Impossible d’exporter la liste des médecins");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-100 p-8 text-gray-900">
      {/* 🔹 En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-extrabold flex items-center gap-3 text-indigo-700"
        >
          <FaUserMd className="text-indigo-600" /> Médecins Aetheris RH
        </motion.h1>

        {/* 🔸 Outils */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <FaSearch className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un médecin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 
                         focus:ring-indigo-500 outline-none bg-white/90 w-72 shadow-sm"
            />
          </div>

          <div className="flex items-center bg-white/80 rounded-xl border border-gray-200 px-3 py-2">
            <FaFilter className="text-indigo-500 mr-2" />
            <select
              aria-label="Trier les médecins"
              title="Trier les médecins"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="bg-transparent outline-none font-semibold text-gray-700"
            >
              <option value="specialite">Spécialité</option>
              <option value="hopital">Hôpital</option>
              <option value="statut">Statut</option>
            </select>
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 
                       text-white font-semibold shadow-md transition-all duration-300 hover:scale-105"
          >
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* 🔹 Contenu */}
      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Chargement des médecins...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 italic">Aucun médecin trouvé</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filtered.map((m, index) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-3xl p-6 shadow-2xl 
                         hover:shadow-indigo-300/40 hover:scale-[1.03] transition-transform duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={m.photo_url || "/assets/default_doctor.png"}
                  alt={`Dr ${m.nom}`}
                  className="w-20 h-20 object-cover rounded-full border-4 border-indigo-400 shadow-lg"
                />
                <div>
                  <h2 className="text-xl font-bold text-indigo-700">
                    Dr {m.prenom || ""} {m.nom}
                  </h2>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <FaEnvelope className="text-indigo-500" /> {m.email}
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    {m.specialite || "Spécialité non précisée"}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                {m.telephone && (
                  <p>
                    <FaPhone className="inline mr-2 text-green-600" />
                    {m.telephone}
                  </p>
                )}
                {m.hopital && (
                  <p>
                    <FaHospital className="inline mr-2 text-indigo-500" />
                    {m.hopital}
                  </p>
                )}
                <p>
                  👔 <b>Rôle :</b> {m.role || "Médecin"}
                </p>
                <p>
                  ✅ <b>Statut :</b> {m.statut || "Actif"}
                </p>
              </div>

              {m.bio && (
                <p className="mt-4 text-gray-600 text-sm italic line-clamp-3 leading-relaxed">
                  {m.bio}
                </p>
              )}

              {/* ✅ Bouton profil complet */}
              <button
                onClick={() => navigate(`/rh/medecins/${m.id}`)}
                className="mt-5 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white 
                           font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                Voir profil complet
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MedecinsListRH;
