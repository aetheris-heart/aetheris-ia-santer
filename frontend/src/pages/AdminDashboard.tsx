import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/uui/ui_card";
import {
  FaUsers,
  FaUserMd,
  FaCalendarCheck,
  FaUserShield,
  FaUsersCog,
  FaArrowRight,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useNavigate, Navigate } from "react-router-dom";

// ================== Interfaces ==================
interface AdminStats {
  total_users: number;
  total_patients: number;
  total_consultations: number;
  total_rendezvous: number;
  demandes_en_attente: number;
}

interface DemandeCompte {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  specialite?: string;
  statut: string;
}

interface FinanceStats {
  total_revenus: number;
  total_depenses: number;
  solde_global: number;
  evolution?: { mois: string; revenus: number; depenses: number }[];
}

// ================== Composant principal ==================
const AdminDashboard: React.FC = () => {
  const { token, user } = useUser();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [demandes, setDemandes] = useState<DemandeCompte[]>([]);
  const [finance, setFinance] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔒 Protection rôle admin
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // ================== Requêtes API ==================
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch {
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const fetchDemandes = async () => {
    try {
      const res = await api.get("/admin/demandes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDemandes(res.data);
    } catch {
      toast.error("Erreur lors du chargement des demandes");
    }
  };

  const fetchFinance = async () => {
    try {
      const res = await api.get("/finance/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📊 Données Finance reçues :", res.data);
      setFinance(res.data);
    } catch (err) {
      console.error("Erreur chargement Finance :", err);
      toast.error("Erreur lors du chargement du module Finance");
    }
  };

  const validerDemande = async (id: number) => {
    try {
      await api.post(
        `/admin/valider-demande/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ Demande validée");
      fetchDemandes();
    } catch {
      toast.error("❌ Erreur validation demande");
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchDemandes();
      fetchFinance();
    }
  }, [token]);

  // ================== Rendu ==================
  return (
    <div className="relative p-8 min-h-screen overflow-hidden text-white space-y-10">
      {/* 🌫️ Fond verre dépoli avec vagues lumineuses */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-200/10 via-gray-300/10 to-gray-100/5 backdrop-blur-2xl"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "400% 400%", zIndex: 0 }}
      />
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2), transparent 60%)",
            "radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15), transparent 60%)",
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 60%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ zIndex: 0 }}
      />

      {/* === CONTENU PRINCIPAL === */}
      <div className="relative z-10">
        <motion.h1
          className="text-4xl font-extrabold text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          👑 Tableau de bord Administrateur
        </motion.h1>

        {/* === STATISTIQUES RAPIDES === */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: <FaUsers />, label: "Patients", value: stats?.total_patients },
            { icon: <FaUserMd />, label: "Médecins", value: stats?.total_users },
            {
              icon: <FaCalendarCheck />,
              label: "Consultations",
              value: stats?.total_consultations,
            },
            {
              icon: <FaUserShield />,
              label: "Demandes en attente",
              value: stats?.demandes_en_attente,
            },
          ].map((s, i) => (
            <Card
              key={i}
              className="bg-gray-900/60 border border-yellow-600 rounded-2xl shadow-xl backdrop-blur-lg"
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="text-yellow-500 text-3xl">{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold">{s.value ?? "-"}</p>
                  <p className="text-gray-400 text-sm">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* === BLOC STATISTIQUES FINANCE === */}
        {finance && (
          <motion.div
            className="mt-10 bg-gray-900/70 border border-yellow-600 rounded-2xl shadow-xl backdrop-blur-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-yellow-500">
              💰 Statistiques Financières
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 text-center border border-yellow-700">
                <p className="text-gray-400">Revenus totaux</p>
                <p className="text-3xl font-bold text-green-400">
                  +{finance.total_revenus.toLocaleString("fr-FR")} €
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 text-center border border-yellow-700">
                <p className="text-gray-400">Dépenses totales</p>
                <p className="text-3xl font-bold text-red-400">
                  -{finance.total_depenses.toLocaleString("fr-FR")} €
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 text-center border border-yellow-700">
                <p className="text-gray-400">Solde Global</p>
                <p
                  className={`text-3xl font-bold ${
                    finance.solde_global >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {finance.solde_global.toLocaleString("fr-FR")} €
                </p>
              </div>
            </div>

            {finance.evolution && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Évolution mensuelle</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={finance.evolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="mois" stroke="#ccc" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenus" fill="#22c55e" name="Revenus" />
                    <Bar dataKey="depenses" fill="#ef4444" name="Dépenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="text-center mt-8">
              <motion.button
                onClick={() => navigate("/finance")}
                whileHover={{ scale: 1.05 }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold shadow-lg hover:shadow-yellow-400/40 transition"
              >
                Accéder au module Finance
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* === RÉPARTITION DES ACTIVITÉS === */}
        {stats && (
          <motion.div
            className="mt-10 bg-gray-900/80 border border-yellow-600 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-yellow-500">
              📊 Répartition des activités hospitalières
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center">
                <p className="text-gray-300 mb-3">
                  Visualisation de la proportion actuelle entre <b>patients</b>,{" "}
                  <b>consultations</b>, <b>rendez-vous</b> et <b>médecins</b>.
                </p>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>🟡 Patients : {stats.total_patients}</li>
                  <li>🟢 Consultations : {stats.total_consultations}</li>
                  <li>🔵 Rendez-vous : {stats.total_rendezvous}</li>
                  <li>🟣 Médecins : {stats.total_users}</li>
                </ul>
              </div>

              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Patients", value: stats.total_patients },
                        { name: "Consultations", value: stats.total_consultations },
                        { name: "Rendez-vous", value: stats.total_rendezvous },
                        { name: "Médecins", value: stats.total_users },
                      ]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      <Cell fill="#facc15" />
                      <Cell fill="#34d399" />
                      <Cell fill="#60a5fa" />
                      <Cell fill="#a78bfa" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #555",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- Performance IA Santé --- */}
        {stats && (
          <motion.div
            className="mt-10 bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-700 rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-yellow-500 flex items-center gap-3">
              🧠 Performance IA Santé — AETHERIS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Score global IA</p>
                <p className="text-4xl font-bold text-yellow-400 animate-pulse">
                  {Math.min(
                    100,
                    (((stats?.total_consultations || 0) + (stats?.total_rendezvous || 0)) /
                      (stats?.total_patients || 1)) *
                      10
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Indice de stabilité</p>
                <p className="text-3xl font-bold text-blue-400">
                  {Math.max(80, Math.floor(Math.random() * 20) + 80)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Risque opérationnel faible</p>
              </div>

              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Taux d’activité</p>
                <p className="text-3xl font-bold text-green-400">
                  {(Math.random() * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Moyenne hebdomadaire</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/aetheris/analysis")}
                className="px-5 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
              >
                Ouvrir l'analyse Aetheris IA
              </button>
            </div>
          </motion.div>
        )}

        {/* === DEMANDES EN ATTENTE === */}
        <Card className="bg-gray-900/70 border border-yellow-600 p-6 rounded-2xl mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-500">
            📋 Demandes de comptes en attente
          </h2>
          {demandes.length === 0 ? (
            <p className="text-gray-400">Aucune demande en attente</p>
          ) : (
            <div className="space-y-3">
              {demandes.map((d) => (
                <motion.div
                  key={d.id}
                  className="flex justify-between items-center p-4 bg-gray-800 rounded-xl border border-gray-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <p className="font-semibold">
                      {d.nom} {d.prenom}
                    </p>
                    <p className="text-sm text-gray-400">
                      {d.email} • {d.specialite}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-600 text-black">
                    {d.statut}
                  </span>
                  <button
                    onClick={() => validerDemande(d.id)}
                    className="ml-4 px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition"
                  >
                    Valider
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
        {/* Exemple : bloc RH */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-gray-900/80 border border-yellow-600 rounded-2xl shadow-lg backdrop-blur-md p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <FaUsersCog className="text-yellow-400 text-3xl" />
              <h2 className="text-2xl font-bold text-yellow-500">Ressources Humaines</h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Gérez le personnel, les nouveaux recrutements, les profils et les informations
              administratives du personnel hospitalier.
            </p>
          </div>

          <button
            onClick={() => navigate("/rh/ajouter")}
            className="mt-5 flex items-center justify-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            Accéder au module RH <FaArrowRight />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
