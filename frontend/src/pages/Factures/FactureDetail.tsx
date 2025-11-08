import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import api from "@/components/lib/axios";
import { toast } from "react-toastify";
import { FaArrowLeft, FaDownload, FaUser, FaFileInvoiceDollar, FaMoneyBill } from "react-icons/fa6";
import { motion } from "framer-motion";
import { FaUserMd } from "react-icons/fa";

interface Facture {
  id: number;
  numero_facture: string;
  montant_ht: number;
  taxe?: number;
  montant_total: number;
  description?: string;
  statut: string;
  methode_paiement?: string;
  reference_paiement?: string;
  date_emission: string;
  date_echeance?: string;
  date_paiement?: string;
  notes_internes?: string;
  patient?: { nom: string; prenom: string };
  medecin?: { nom: string; prenom: string };
}

const FactureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();
  const [facture, setFacture] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacture = async () => {
      try {
        const res = await api.get<Facture>(`/factures/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFacture(res.data);
      } catch (err) {
        console.error(err);
        toast.error("❌ Erreur lors du chargement de la facture.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFacture();
  }, [id, token]);

  const telechargerPDF = async () => {
    if (!facture?.id) return;
    try {
      const res = await api.get(`/pdf/facture/${facture.id}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `facture_${facture.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("📄 PDF téléchargé avec succès !");
    } catch (err) {
      console.error("Erreur export PDF :", err);
      toast.error("❌ Impossible de télécharger le PDF.");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-yellow-500 animate-pulse">
        Chargement des données de la facture...
      </p>
    );

  if (!facture) return <p className="text-center mt-10 text-red-500">Facture introuvable.</p>;

  const statutClass =
    facture.statut === "payée"
      ? "bg-green-600 animate-pulse"
      : facture.statut === "partiel"
        ? "bg-yellow-500 animate-pulse"
        : facture.statut === "annulée"
          ? "bg-red-600"
          : "bg-gray-500";

  return (
    <div className="relative min-h-screen overflow-hidden text-white p-10">
      {/* 🌌 Arrière-plan dynamique */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%" }}
      />

      {/* 🌠 Halo lumineux */}
      <motion.div
        className="absolute inset-0 opacity-25"
        animate={{
          background: [
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 70%)",
            "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15), transparent 70%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto bg-gray-900/80 border border-yellow-600 shadow-2xl rounded-2xl p-8 backdrop-blur-md">
        {/* 🔙 Retour */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/finance")}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            <FaArrowLeft /> Retour au module Finance
          </button>
          <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaFileInvoiceDollar className="inline-block mr-2 text-yellow-400" />
            Facture #{facture.numero_facture}
          </motion.h1>
        </div>

        {/* 🧾 Bloc principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 bg-gray-800/70 border border-yellow-700 rounded-2xl p-6 shadow-lg"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p>
              <FaUser className="inline text-yellow-500 mr-2" />
              <strong>Patient :</strong>{" "}
              {facture.patient ? `${facture.patient.nom} ${facture.patient.prenom}` : "—"}
            </p>

            {facture.medecin && (
              <p>
                <FaUserMd className="inline text-cyan-400 mr-2" />
                <strong>Médecin :</strong> {`${facture.medecin.nom} ${facture.medecin.prenom}`}
              </p>
            )}

            <p>
              <FaMoneyBill className="inline text-green-400 mr-2" />
              <strong>Montant HT :</strong> {facture.montant_ht} €
            </p>
            <p>
              <strong>Taxe :</strong> {facture.taxe || 0} %
            </p>
            <p>
              <strong>Total TTC :</strong>{" "}
              <span className="text-yellow-400 font-semibold">{facture.montant_total} €</span>
            </p>

            <p>
              <strong>Date émission :</strong>{" "}
              {new Date(facture.date_emission).toLocaleDateString()}
            </p>

            {facture.date_echeance && (
              <p>
                <strong>Échéance :</strong> {new Date(facture.date_echeance).toLocaleDateString()}
              </p>
            )}
            {facture.date_paiement && (
              <p>
                <strong>Date paiement :</strong>{" "}
                {new Date(facture.date_paiement).toLocaleDateString()}
              </p>
            )}

            <p>
              <strong>Statut :</strong>{" "}
              <span
                className={`${statutClass} px-3 py-1 rounded-lg text-sm font-bold text-white shadow-md`}
              >
                {facture.statut.toUpperCase()}
              </span>
            </p>

            <p>
              <strong>Méthode de paiement :</strong> {facture.methode_paiement || "—"}
            </p>

            {facture.reference_paiement && (
              <p>
                <strong>Référence :</strong> {facture.reference_paiement}
              </p>
            )}
          </div>

          <hr className="my-4 border-gray-700" />

          <p>
            <strong>Description :</strong> {facture.description || "Aucune description."}
          </p>

          {facture.notes_internes && (
            <p className="italic text-gray-400">
              <strong>Notes internes :</strong> {facture.notes_internes}
            </p>
          )}
        </motion.div>

        {/* 📥 Bouton PDF */}
        <div className="flex justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={telechargerPDF}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg shadow-lg"
          >
            <FaDownload /> Télécharger le PDF
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FactureDetail;
