import React, { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaFilePdf,
  FaEye,
  FaPlus,
  FaMagnifyingGlass,
  FaFilter,
  FaUserDoctor,
  FaMoneyBillWave,
} from "react-icons/fa6";

interface Facture {
  id: number;
  montant_total: number;
  statut: string;
  methode_paiement?: string;
  date_emission: string;
  patient_nom: string;
  patient_prenom: string;
}

const ListeFactures: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [filters, setFilters] = useState({
    statut: "",
    methode_paiement: "",
    patient: "",
  });
  const [loading, setLoading] = useState(true);

  // 🔄 Charger les factures
  const fetchFactures = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""));
      const res = await api.get("/factures", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setFactures(res.data as Facture[]);
    } catch (err) {
      toast.error("❌ Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchFactures();
  }, [token]);

  // 🎯 Gestion filtres
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFactures();
  };

  // 📥 Téléchargement PDF
  const telechargerPDF = async (url: string, filename: string) => {
    try {
      const response = await api.get(url, { responseType: "blob" });
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("📄 PDF téléchargé !");
    } catch (err) {
      console.error("❌ Erreur export PDF :", err);
      toast.error("Impossible de télécharger le PDF");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white p-10">
      {/* 🌌 Fond animé */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%" }}
      />

      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15), transparent 70%)",
            "radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15), transparent 70%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 space-y-10">
        {/* 🔝 En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-md flex items-center gap-3"
          >
            <FaMoneyBillWave className="text-yellow-400" />
            Facturation Aetheris
          </motion.h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/factures/ajouter")}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition shadow-lg"
          >
            <FaPlus /> Nouvelle Facture
          </motion.button>
        </div>

        {/* 🔍 Filtres */}
        <motion.form
          onSubmit={handleSearch}
          className="bg-gray-900/80 border border-yellow-600 backdrop-blur-lg p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <label htmlFor="patient" className="block text-sm mb-1 text-gray-300">
              Patient
            </label>
            <input
              id="patient"
              type="text"
              name="patient"
              placeholder="Nom du patient"
              value={filters.patient}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label htmlFor="statut" className="block text-sm mb-1 text-gray-300">
              Statut
            </label>
            <select
              id="statut"
              name="statut"
              value={filters.statut}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Tous</option>
              <option value="en attente">En attente</option>
              <option value="payée">Payée</option>
              <option value="partiel">Partielle</option>
              <option value="annulée">Annulée</option>
            </select>
          </div>

          <div>
            <label htmlFor="methode_paiement" className="block text-sm mb-1 text-gray-300">
              Méthode de paiement
            </label>
            <select
              id="methode_paiement"
              name="methode_paiement"
              value={filters.methode_paiement}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Toutes</option>
              <option value="CB">Carte bancaire</option>
              <option value="Espèces">Espèces</option>
              <option value="Virement">Virement</option>
              <option value="Assurance">Assurance</option>
            </select>
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
            >
              <FaMagnifyingGlass /> Rechercher
            </motion.button>
          </div>
        </motion.form>

        {/* 📊 Tableau des factures */}
        {loading ? (
          <p className="text-center text-yellow-400 mt-10 animate-pulse">
            Chargement des factures...
          </p>
        ) : factures.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">
            Aucune facture trouvée pour ces critères.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-yellow-700 shadow-xl bg-gray-900/90 backdrop-blur-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-yellow-600/20 via-yellow-500/10 to-yellow-600/20 border-b border-yellow-700 text-yellow-400 uppercase text-sm">
                <tr>
                  <th className="p-4 text-left">#</th>
                  <th className="p-4 text-left">Patient</th>
                  <th className="p-4 text-left">Montant</th>
                  <th className="p-4 text-left">Statut</th>
                  <th className="p-4 text-left">Paiement</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((facture, i) => (
                  <motion.tr
                    key={facture.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-800/60 transition duration-200"
                  >
                    <td className="p-4 text-gray-400 font-medium">{facture.id}</td>
                    <td className="p-4 text-white">
                      {facture.patient_nom} {facture.patient_prenom}
                    </td>
                    <td className="p-4 text-yellow-400 font-semibold">
                      {facture.montant_total.toLocaleString()} €
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          facture.statut === "payée"
                            ? "bg-green-600/40 text-green-300"
                            : facture.statut === "en attente"
                              ? "bg-yellow-600/40 text-yellow-300"
                              : facture.statut === "partiel"
                                ? "bg-orange-600/40 text-orange-300"
                                : "bg-red-600/40 text-red-300"
                        }`}
                      >
                        {facture.statut}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{facture.methode_paiement || "-"}</td>
                    <td className="p-4 text-gray-400">
                      {new Date(facture.date_emission).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4 flex justify-center gap-6 text-lg">
                      <Link
                        to={`/factures/${facture.id}`}
                        className="text-blue-400 hover:text-blue-300 transition"
                        title="Voir les détails"
                      >
                        <FaEye />
                      </Link>
                      <button
                        onClick={() =>
                          telechargerPDF(`/pdf/facture/${facture.id}`, `facture_${facture.id}.pdf`)
                        }
                        className="text-red-500 hover:text-red-400 transition"
                        title="Télécharger PDF"
                      >
                        <FaFilePdf />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeFactures;
