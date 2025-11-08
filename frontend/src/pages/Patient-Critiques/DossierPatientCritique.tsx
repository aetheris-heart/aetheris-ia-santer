import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaFilePdf,
  FaUserMd,
  FaBirthdayCake,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeartbeat,
  FaBell,
  FaRobot,
} from "react-icons/fa";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui/ui_card";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Area,
} from "recharts";

// --- Types ---
interface DossierComplet {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  email: string;
  telephone: string;
  adresse: string;
  pathologies: string;
  traitements: string;
  observations: string;
  alertes: string[];
  date_creation: string;
}

interface EtatClinique {
  spo2: number;
  rythme_cardiaque: number;
  temperature: number;
  created_at: string;
}

interface AnalyseIA {
  patient: {
    id: number;
    nom: string;
    prenom: string;
    age?: number;
    sexe?: string;
  };
  diagnostic: string;
  prediction: {
    risques_detectes: string;
    suggestions: string;
  };
  recommendation: string;
  plan: {
    prise_en_charge: string[];
    prescriptions_proposees: {
      OTC: string[];
      A_valider_par_medecin: string[];
    };
    signes_alerte: string[];
  };
  surveillance: {
    spo2: number;
    rythme_cardiaque: number;
    temperature: number;
  };
  historique: { time: string; spo2: number; hr: number; temp: number }[];
  date: string;
  disclaimer: string;
}

const DossierPatientCritique: React.FC = () => {
  const { token } = useUser();
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<DossierComplet | null>(null);
  const [etatClinique, setEtatClinique] = useState<EtatClinique[]>([]);
  const [analyseIA, setAnalyseIA] = useState<AnalyseIA | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger dossier patient critique
  useEffect(() => {
    if (!patientId || !token) return;

    const fetchDossier = async () => {
      try {
        const res = await api.get<DossierComplet>(`/patients-critiques/${patientId}/dossier`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDossier(res.data);
      } catch (e: any) {
        console.error("Erreur dossier critique:", e?.response?.data || e);
        toast.error("Impossible de charger le dossier du patient critique.");
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [patientId, token]);

  // 🔄 Charger données cliniques temps réel
  useEffect(() => {
    if (!patientId || !token) return;

    const fetchEtatClinique = async () => {
      try {
        const res = await api.get<EtatClinique[]>(`/etatclinique/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEtatClinique(res.data);
      } catch (e: any) {
        console.warn("Impossible de charger l'état clinique :", e?.response?.data || e);
      }
    };

    fetchEtatClinique();
    const interval = setInterval(fetchEtatClinique, 15000);
    return () => clearInterval(interval);
  }, [patientId, token]);

  // 🔄 Charger analyse IA Aetheris
  useEffect(() => {
    if (!patientId || !token) return;

    const fetchAnalyseIA = async () => {
      try {
        const res = await api.get<AnalyseIA>(`/aetheris/analysis/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalyseIA(res.data);
      } catch (e: any) {
        console.warn("Pas d’analyse IA pour ce patient :", e?.response?.data || e);
      }
    };

    fetchAnalyseIA();
  }, [patientId, token]);

  // --- Actions ---
  const handleRetour = () => navigate("/patients-critiques");

  const handleExportPDF = async () => {
    try {
      const res = await api.get<Blob>(`/patients/${patientId}/export-pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Patient_${dossier?.nom}_${dossier?.prenom}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (e) {
      console.error("Export PDF error:", e);
      toast.error("Échec de l’export PDF.");
    }
  };

  const handleAlerteEquipe = () => {
    toast.info("🚨 Alerte envoyée à l’équipe médicale !");
  };

  // --- Statut patient ---
  const getStatutPatient = () => {
    if (!dossier) return "—";
    if (dossier.alertes.find((a) => a.includes("⚠️"))) return "Critique";
    if (dossier.alertes.length > 0) return "À surveiller";
    return "Stable";
  };

  // --- Render ---
  if (loading) return <div className="text-center mt-10">⏳ Chargement du dossier...</div>;
  if (!dossier)
    return <div className="text-center mt-10 text-red-600">❌ Aucun dossier trouvé.</div>;

  return (
    <div className="p-6 space-y-6 bg-transparent">
      {/* --- Header --- */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleRetour}
          className="bg-white/40 dark:bg-gray-800/60 text-gray-900 dark:text-white px-4 py-2 rounded-lg backdrop-blur-md hover:bg-white/60 dark:hover:bg-gray-700 transition flex items-center gap-2 shadow-md"
        >
          <FaArrowLeft /> Retour
        </button>
        <div className="flex gap-4">
          <button
            onClick={handleAlerteEquipe}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition flex items-center gap-2 shadow-lg"
          >
            <FaBell /> Alerter équipe
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg hover:scale-105 transition flex items-center gap-2 shadow-lg"
          >
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* --- Identité Patient --- */}
      <Card className="bg-white/50 dark:bg-gray-800/70 backdrop-blur-lg shadow-xl">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaUserMd className="text-blue-500" /> {dossier.prenom} {dossier.nom}
          </h2>
          <p className="text-sm font-semibold">
            Statut :{" "}
            {getStatutPatient() === "Critique" && <span className="text-red-600">🔴 Critique</span>}
            {getStatutPatient() === "À surveiller" && (
              <span className="text-yellow-600">🟡 À surveiller</span>
            )}
            {getStatutPatient() === "Stable" && <span className="text-green-600">🟢 Stable</span>}
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <p>
              <FaBirthdayCake className="inline mr-2 text-pink-400" /> Âge :{" "}
              <strong>{dossier.age} ans</strong>
            </p>
            <p>
              <FaEnvelope className="inline mr-2 text-indigo-400" /> Email :{" "}
              <strong>{dossier.email}</strong>
            </p>
            <p>
              <FaPhone className="inline mr-2 text-green-400" /> Téléphone :{" "}
              <strong>{dossier.telephone}</strong>
            </p>
            <p>
              <FaMapMarkerAlt className="inline mr-2 text-yellow-400" /> Adresse :{" "}
              <strong>{dossier.adresse}</strong>
            </p>
          </div>
          <p className="mt-2 text-sm">
            📅 Créé le {new Date(dossier.date_creation).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* --- Données Cliniques --- */}
      <Card className="bg-white/50 dark:bg-gray-800/70 backdrop-blur-lg shadow-xl">
        <CardContent>
          <h3 className="text-xl font-semibold mb-3 text-red-700 flex items-center gap-2">
            <FaHeartbeat /> Données Cliniques
          </h3>
          <p>
            <strong>Pathologies :</strong> {dossier.pathologies}
          </p>
          <p>
            <strong>Traitements :</strong> {dossier.traitements}
          </p>
          <p>
            <strong>Observations :</strong> {dossier.observations}
          </p>
          <div className="mt-4">
            <strong className="text-red-700">⚠️ Alertes :</strong>
            <ul className="list-disc ml-6 text-red-800">
              {dossier.alertes.length ? (
                dossier.alertes.map((a, i) => <li key={i}>{a}</li>)
              ) : (
                <li>Aucune alerte détectée</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* --- Graphiques temps réel --- */}
      <Card className="bg-white/50 dark:bg-gray-800/70 backdrop-blur-lg shadow-xl">
        <CardContent>
          <h3 className="text-xl font-semibold mb-4 text-blue-600 flex items-center gap-2">
            📊 Surveillance Temps Réel
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={etatClinique}>
              {/* Définition des dégradés */}
              <defs>
                <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="created_at" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", color: "#fff", borderRadius: "8px" }}
                labelStyle={{ fontWeight: "bold", color: "#93c5fd" }}
                formatter={(value: number, name: string) => {
                  if (name === "spo2") return [`${value}%`, "SpO₂"];
                  if (name === "rythme_cardiaque") return [`${value} bpm`, "FC"];
                  if (name === "temperature") return [`${value} °C`, "Température"];
                  return value;
                }}
              />
              <Legend />

              {/* SPO2 */}
              <Line
                type="monotone"
                dataKey="spo2"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Area type="monotone" dataKey="spo2" stroke="none" fill="url(#colorSpo2)" />

              {/* Rythme cardiaque */}
              <Line
                type="monotone"
                dataKey="rythme_cardiaque"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Area type="monotone" dataKey="rythme_cardiaque" stroke="none" fill="url(#colorHr)" />

              {/* Température */}
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Area type="monotone" dataKey="temperature" stroke="none" fill="url(#colorTemp)" />
            </LineChart>
          </ResponsiveContainer>

          {/* Dernières valeurs */}
          {etatClinique.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                <span className="text-blue-600 font-bold">SpO₂</span>
                <p className="text-lg">{etatClinique[etatClinique.length - 1]?.spo2 ?? "—"}%</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg">
                <span className="text-red-600 font-bold">FC</span>
                <p className="text-lg">
                  {etatClinique[etatClinique.length - 1]?.rythme_cardiaque ?? "—"} bpm
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-lg">
                <span className="text-yellow-600 font-bold">Température</span>
                <p className="text-lg">
                  {etatClinique[etatClinique.length - 1]?.temperature ?? "—"} °C
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Analyse IA Aetheris --- */}
      <Card className="bg-white/50 dark:bg-gray-800/70 backdrop-blur-lg shadow-xl">
        <CardContent>
          <h3 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
            <FaRobot /> Analyse IA Aetheris
          </h3>

          {analyseIA ? (
            <div className="space-y-3 text-gray-900 dark:text-gray-100">
              <p>
                <strong>🩺 Diagnostic :</strong> {analyseIA.diagnostic}
              </p>
              <p>
                <strong>🔮 Risques :</strong> {analyseIA.prediction?.risques_detectes || "—"}
              </p>
              <p>
                <strong>💡 Suggestions :</strong> {analyseIA.prediction?.suggestions || "—"}
              </p>
              <p>
                <strong>📋 Recommandations :</strong> {analyseIA.recommendation || "—"}
              </p>

              {/* 🧠 Plan de prise en charge */}
              <div>
                <strong>🩺 Plan de prise en charge :</strong>
                <ul className="list-disc ml-6">
                  {analyseIA.plan?.prise_en_charge?.length ? (
                    analyseIA.plan.prise_en_charge.map((p, i) => <li key={i}>{p}</li>)
                  ) : (
                    <li>Aucune donnée</li>
                  )}
                </ul>
              </div>

              {/* 💊 Prescriptions */}
              <div>
                <strong>💊 Prescriptions :</strong>
                <ul className="list-disc ml-6">
                  {analyseIA.plan?.prescriptions_proposees?.OTC?.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                  {analyseIA.plan?.prescriptions_proposees?.A_valider_par_medecin?.map((p, i) => (
                    <li key={i}>⚠️ {p}</li>
                  ))}
                </ul>
              </div>

              {/* ⚠️ Signes d’alerte */}
              <div>
                <strong>⚠️ Signes d’alerte :</strong>
                <ul className="list-disc ml-6 text-red-600">
                  {analyseIA.plan?.signes_alerte?.length ? (
                    analyseIA.plan.signes_alerte.map((s, i) => <li key={i}>{s}</li>)
                  ) : (
                    <li>Aucun signe d’alerte</li>
                  )}
                </ul>
              </div>

              <p className="text-xs italic text-gray-500">{analyseIA.disclaimer}</p>

              <Link
                to={`/aetheris-analyse/${patientId}`}
                className="mt-3 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
              >
                🔎 Voir l’analyse détaillée
              </Link>
            </div>
          ) : (
            <p className="italic">Aucune analyse IA disponible pour ce patient.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DossierPatientCritique;
