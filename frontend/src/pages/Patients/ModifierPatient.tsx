import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  age?: number;
  rythme_cardiaque?: number;
  spo2?: number;
  temperature?: number;
  traitement?: string;
  email?: string;
  adresse?: string;
  telephone?: string;
  groupe_sanguin?: string;
  allergies?: string;
  antecedents?: string;
}

const ModifierPatient: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { token } = useUser();

  const [formData, setFormData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!token || !patientId) return;
      try {
        const res = await api.get<Patient>(`/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("❌ Impossible de charger les informations du patient.");
      }
    };
    fetchPatient();
  }, [patientId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !patientId) return;

    try {
      setLoading(true);
      await api.put(`/patients/${patientId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Patient mis à jour avec succès !");
      navigate(`/dossiers/${patientId}`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Échec de la mise à jour du patient.");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="text-center text-gray-300 p-8">Chargement des informations patient...</div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
      <div
        className="w-full max-w-4xl bg-white/10 dark:bg-gray-800/30 
                      backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
      >
        <h2 className="text-3xl font-extrabold text-center mb-8 text-white drop-shadow-lg">
          ✏️ Modifier les informations du patient
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label htmlFor="nom" className="block text-sm mb-1 text-white">
              Nom
            </label>
            <input
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={glassInput}
              required
            />
          </div>

          {/* Prénom */}
          <div>
            <label htmlFor="prenom" className="block text-sm mb-1 text-white">
              Prénom
            </label>
            <input
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className={glassInput}
              required
            />
          </div>

          {/* Date de naissance */}
          <div>
            <label htmlFor="date_naissance" className="block text-sm mb-1 text-white">
              Date de naissance
            </label>
            <input
              id="date_naissance"
              type="date"
              name="date_naissance"
              value={formData.date_naissance}
              onChange={handleChange}
              className={glassInput}
              required
            />
          </div>

          {/* Sexe */}
          <div>
            <label htmlFor="sexe" className="block text-sm mb-1 text-white">
              Sexe
            </label>
            <select
              id="sexe"
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              className={glassInput}
              required
            >
              <option value="">Sélectionner</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          {/* Âge */}
          <div>
            <label htmlFor="age" className="block text-sm mb-1 text-white">
              Âge
            </label>
            <input
              id="age"
              type="number"
              name="age"
              value={formData.age || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Rythme cardiaque */}
          <div>
            <label htmlFor="rythme_cardiaque" className="block text-sm mb-1 text-white">
              Rythme cardiaque
            </label>
            <input
              id="rythme_cardiaque"
              type="number"
              name="rythme_cardiaque"
              value={formData.rythme_cardiaque || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* SpO2 */}
          <div>
            <label htmlFor="spo2" className="block text-sm mb-1 text-white">
              SpO₂ (%)
            </label>
            <input
              id="spo2"
              type="number"
              step="0.1"
              name="spo2"
              value={formData.spo2 || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Température */}
          <div>
            <label htmlFor="temperature" className="block text-sm mb-1 text-white">
              Température (°C)
            </label>
            <input
              id="temperature"
              type="number"
              step="0.1"
              name="temperature"
              value={formData.temperature || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Traitement */}
          <div className="md:col-span-2">
            <label htmlFor="traitement" className="block text-sm mb-1 text-white">
              Traitement
            </label>
            <input
              id="traitement"
              name="traitement"
              value={formData.traitement || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm mb-1 text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Adresse */}
          <div className="md:col-span-2">
            <label htmlFor="adresse" className="block text-sm mb-1 text-white">
              Adresse
            </label>
            <input
              id="adresse"
              name="adresse"
              value={formData.adresse || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="telephone" className="block text-sm mb-1 text-white">
              Téléphone
            </label>
            <input
              id="telephone"
              name="telephone"
              value={formData.telephone || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Groupe sanguin */}
          <div>
            <label htmlFor="groupe_sanguin" className="block text-sm mb-1 text-white">
              Groupe sanguin
            </label>
            <input
              id="groupe_sanguin"
              name="groupe_sanguin"
              value={formData.groupe_sanguin || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Allergies */}
          <div className="md:col-span-2">
            <label htmlFor="allergies" className="block text-sm mb-1 text-white">
              Allergies
            </label>
            <input
              id="allergies"
              name="allergies"
              value={formData.allergies || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Antécédents */}
          <div className="md:col-span-2">
            <label htmlFor="antecedents" className="block text-sm mb-1 text-white">
              Antécédents médicaux
            </label>
            <input
              id="antecedents"
              name="antecedents"
              value={formData.antecedents || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          <div className="col-span-2 text-right mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-2xl font-semibold shadow-lg 
                         bg-indigo-600/80 hover:bg-indigo-700/90 text-white 
                         transition backdrop-blur-md"
            >
              {loading ? "⏳ Sauvegarde..." : "💾 Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Style glass input
const glassInput =
  "w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-gray-700/40 backdrop-blur-md border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none transition";

export default ModifierPatient;
