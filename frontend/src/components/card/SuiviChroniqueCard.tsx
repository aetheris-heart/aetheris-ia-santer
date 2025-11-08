// frontend/src/components/card/SuiviChroniqueCard.tsx
import React, { useEffect, useState } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui/ui_card";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface SuiviChroniqueCardProps {
  patientId: string;
}

interface ChronicData {
  last_update: string;
  status: string;
  comments: string;
}

// Composant fonctionnel
const SuiviChroniqueCard: React.FC<SuiviChroniqueCardProps> = ({ patientId }) => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState<ChronicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !patientId) return;

    const fetchChronicData = async () => {
      try {
        const response = await api.get<ChronicData>(`/patients/${patientId}/suivi-chronique`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch (error) {
        console.error("Erreur récupération suivi chronique:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChronicData();

    // Mise à jour toutes les 30s
    const interval = setInterval(fetchChronicData, 30000);
    return () => clearInterval(interval);
  }, [token, patientId]);

  return (
    <div
      onClick={() => navigate(`/patients/${patientId}/suivi-chronique`)}
      className="cursor-pointer hover:scale-[1.03] transition-all duration-300"
    >
      <Card className="bg-gradient-to-br from-green-100 to-emerald-200 dark:from-emerald-900 dark:to-green-800 shadow-xl rounded-xl p-4 border border-green-300 dark:border-emerald-700">
        <CardContent>
          <h3 className="text-lg font-bold text-green-700 dark:text-emerald-200 mb-2 flex items-center gap-2">
            🩺 Suivi Chronique
          </h3>

          {loading ? (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">Chargement...</p>
          ) : data ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Dernière mise à jour :{" "}
                <strong>{new Date(data.last_update).toLocaleString()}</strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Statut : <strong>{data.status}</strong>
              </p>
              {data.comments && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle size={16} />
                  {data.comments}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Aucune donnée disponible
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuiviChroniqueCard;
