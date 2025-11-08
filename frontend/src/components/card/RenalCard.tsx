import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/uui/ui_card";
import { Droplet, Shield, Activity, AlertTriangle } from "lucide-react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";

interface Props {
  patientId: string;
}

interface RenalData {
  creatinine?: number | null;
  filtration_glomerulaire?: number | null;
  niveau_risque?: string | null;
  alerte?: string | null;
  score_sante?: number | null;
  historique?: { date: string; valeur: number }[];
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded ${className}`} />
);

const RenalCard: React.FC<Props> = ({ patientId }) => {
  const { token } = useUser();
  const [data, setData] = useState<RenalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !patientId) return;

    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await api.get<RenalData>(`/renal/${patientId}/latest`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });
        setData(res.data);
      } catch (e: any) {
        if (e?.name !== "CanceledError" && e?.message !== "canceled") {
          if (e.response) {
            console.error("❌ Erreur backend rénal :", e.response.status, e.response.data);
            setErr(e.response.data?.detail || "Erreur backend fonction rénale.");
          } else {
            console.error("❌ Erreur réseau rénal :", e.message);
            setErr("Erreur réseau lors du chargement des données rénales.");
          }
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [token, patientId]);

  const chartData = useMemo(
    () =>
      data?.historique?.map((r) => ({
        date: r.date,
        valeur: r.valeur,
      })) || [],
    [data]
  );

  const risqueColor =
    data?.niveau_risque === "Critique"
      ? "text-red-600"
      : data?.niveau_risque === "Élevé"
        ? "text-orange-500"
        : data?.niveau_risque === "Modéré"
          ? "text-yellow-500"
          : "text-green-600";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate("/renal")}
      className="cursor-pointer"
    >
      <Card className="rounded-2xl shadow-md bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 relative overflow-hidden transition-all hover:shadow-xl">
        {/* Halo IA animé */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse" />

        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Droplet className="text-blue-600 dark:text-blue-400 text-xl" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Fonction rénale
              </h2>
            </div>
            <Shield className="text-indigo-600 dark:text-indigo-400 text-lg" />
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
              <Skeleton className="h-48" />
            </div>
          ) : err ? (
            <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
          ) : data ? (
            <div>
              {/* ✅ Sécurisé contre les undefined */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Créatinine</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {data.creatinine != null ? `${data.creatinine.toFixed(2)} mg/dL` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Filtration glomérulaire
                  </p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {data.filtration_glomerulaire != null
                      ? `${data.filtration_glomerulaire.toFixed(1)} mL/min`
                      : "—"}
                  </p>
                </div>
              </div>

              {data.alerte && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                  ⚠️ {data.alerte}
                </p>
              )}

              <p className={`text-sm font-semibold ${risqueColor} mb-4`}>
                {data.niveau_risque || "Risque normal"}
              </p>

              {/* Score santé IA */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (data.score_sante ?? 0) > 80
                      ? "bg-green-500"
                      : (data.score_sante ?? 0) > 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${data.score_sante ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Score santé rénale IA : {data.score_sante?.toFixed(1) ?? "—"}%
              </p>

              {/* Graphique historique */}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="valeur" name="DFG (mL/min)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée disponible.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RenalCard;
