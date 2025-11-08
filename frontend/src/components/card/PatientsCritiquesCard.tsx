import { useEffect, useState } from "react";
import axios from "@/components/lib/axios";
import { useNavigate } from "react-router-dom";
import type { PatientCritique } from "@/types";
import { Card, CardContent } from "@/components/uui/ui_card";

const PatientsCritiquesCard = () => {
  const [patients, setPatients] = useState<PatientCritique[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCritiques = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/dashboard/patients-critiques", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setPatients(res.data);
        } else {
          console.warn("⚠️ Données inattendues reçues :", res.data);
          setPatients([]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des patients critiques :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCritiques();
  }, []);

  return (
    <Card className="w-full bg-gradient-to-br from-red-100 via-white to-red-200 dark:from-gray-800 dark:to-red-900 border border-red-400 dark:border-red-600 shadow-xl rounded-3xl">
      <CardContent>
        <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-4">
          🚨 Patients critiques
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-300">Chargement en cours...</p>
        ) : patients.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Aucun patient critique actuellement.
          </p>
        ) : (
          <ul className="space-y-3">
            {patients.map((p) => (
              <li
                key={p.id}
                onClick={() => navigate(`/patients-critiques/${p.id}/dossier`)}
                className="p-3 bg-white dark:bg-gray-800 rounded-xl border hover:scale-[1.02] transition-all cursor-pointer shadow hover:border-red-500"
              >
                <p className="font-semibold text-lg text-red-700 dark:text-red-300">
                  {p.prenom} {p.nom}
                </p>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  ❤ {p.rythme_cardiaque} bpm ({p.critere_cardiaque}) • 🫁 {p.spo2}% (
                  {p.critere_spo2}) • 🌡 {p.température}°C ({p.critere_temp})
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Score de risque : <span className="font-bold text-red-600">{p.risk_score}%</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientsCritiquesCard;
