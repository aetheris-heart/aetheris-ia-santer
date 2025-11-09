import React, { useState, type ChangeEvent } from "react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

interface AnalyseIAResponse {
  id: number;
  description: string;
  observations?: string;
  score?: number;
  type_analyse?: string;
  created_at: string;
}
interface AnalyseIAFormData {
  patient_id: string;
  type: string;
  rapport: string;
  niveau_risque: string;
}

const AnalyseIAForm: React.FC = () => {
  const { token } = useUser();
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState("");
  const [typeAnalyse, setTypeAnalyse] = useState("cardiaque");
  const [score, setScore] = useState("");
  const [patientId, setPatientId] = useState("");
  const [result, setResult] = useState<AnalyseIAResponse | null>(null);
const [formData, setFormData] = useState<AnalyseIAFormData>({
  patient_id: "",
  type: "",
  rapport: "",
  niveau_risque: "",
});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("❌ Vous devez être connecté");
      return;
    }

    try {
      const response = await api.post<AnalyseIAResponse>(
        `/analyse-ia/${patientId}`,
        {
          description,
          observations: observations || null,
          score: score ? parseFloat(score) : null,
          type_analyse: typeAnalyse,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResult(response.data);
      toast.success("✅ Analyse IA enregistrée avec succès !");
      setDescription("");
      setObservations("");
      setScore("");
    } catch (error: any) {
      console.error("Erreur analyse IA:", error);
      toast.error("❌ Erreur lors de l’analyse IA");
    }
  };

  function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        ⚡ Analyse IA – Consultation
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="ID du patient"
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          required
        />

        <textarea
          placeholder="Description de l’analyse (ex: suspicion infection)"
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <textarea
          placeholder="Observations (optionnel)"
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />

        <input
          type="number"
          placeholder="Score (optionnel)"
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <div>
  <label
    htmlFor="type"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Type d’analyse IA
  </label>
  <select
    id="type"
    name="type"
    value={formData.type}
    onChange={handleChange}
    className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-400"
    required
    aria-label="Type d’analyse IA"
  >
    <option value="">-- Sélectionnez un type d’analyse --</option>
    <option value="cardiaque">Cardiaque</option>
    <option value="neurologique">Neurologique</option>
    <option value="digestive">Digestive</option>
    <option value="pulmonaire">Pulmonaire</option>
    <option value="rénale">Rénale</option>
    <option value="métabolique">Métabolique</option>
  </select>
</div>


        <button
          type="submit"
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md hover:scale-105 transition"
        >
          🚀 Lancer l’analyse IA
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 rounded-xl bg-white/40 dark:bg-gray-700/40 backdrop-blur-md border border-white/20 shadow-inner">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Résultat IA</h3>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
            📝 Description : {result.description}
          </p>
          {result.observations && (
            <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">
              🔍 Observations : {result.observations}
            </p>
          )}
          {result.score !== undefined && result.score !== null && (
            <p className="text-gray-700 dark:text-gray-300 mt-2">📊 Score : {result.score}</p>
          )}
          {result.type_analyse && (
            <p className="text-gray-700 dark:text-gray-300 mt-2">🧬 Type : {result.type_analyse}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyseIAForm;
