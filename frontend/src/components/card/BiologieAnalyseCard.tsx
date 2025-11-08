import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui/ui_card";
import { FaFlask } from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { toast } from "react-toastify";

interface Biologie {
  id: number;
  etat: string;
  type_analyse?: string;
  categorie?: string;
  resultats?: string;
}

const COLORS = ["#10B981", "#FBBF24", "#EF4444"]; // ✅ Validé, ⏳ En attente, ⚠️ Autre

const BiologieAnalyseCard: React.FC = () => {
  const { token } = useUser();
  const [analyses, setAnalyses] = useState<Biologie[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchBiologie = async () => {
      try {
        const res = await api.get<Biologie[]>("/biologie/", {
          headers: { Authorization: `Bearer ${token}` }, // ✅ ajout du token
        });
        setAnalyses(res.data);
      } catch (error: any) {
        const msg =
          error?.response?.data?.detail ||
          error?.message ||
          "❌ Erreur inconnue lors du chargement Biologie.";
        toast.error(msg);
        console.error("❌ Erreur Biologie :", msg, error);
      }
    };

    fetchBiologie();
  }, [token]);

  const total = analyses.length;
  const valides = analyses.filter((a) => a.etat === "Validé").length;
  const enAttente = analyses.filter((a) => a.etat === "En attente").length;
  const autres = total - valides - enAttente;

  const data = [
    { name: "Validées", value: valides },
    { name: "En attente", value: enAttente },
    { name: "Autres", value: autres },
  ];

  return (
    <Card
      onClick={() => navigate("/biologie")} // ✅ clique redirige vers BiologieList
      className="cursor-pointer bg-gradient-to-br from-emerald-100 via-white to-emerald-200 
                 dark:from-gray-800 dark:to-emerald-900 border border-emerald-400/40 
                 shadow-xl hover:scale-[1.02] transition-all rounded-2xl"
    >
      <CardContent className="flex items-center justify-between">
        {/* Texte */}
        <div>
          <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <FaFlask /> Biologie
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{total} analyses au total</p>
          <p className="text-xs text-emerald-500 dark:text-emerald-400">
            {valides} validées • {enAttente} en attente
          </p>
        </div>

        {/* Graphique */}
        <div className="w-24 h-24">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={40}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiologieAnalyseCard;
