import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

const glassInput =
  "w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-gray-700/40 backdrop-blur-md border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none transition";

interface DossierMedical {
  id: number;
  patient_id: number;
  resume?: string;
  antecedents?: string;
  traitements?: string;
  allergies?: string;
  notes?: string;
  pathologies?: string;
  chirurgies?: string;
  examens?: string;
}

const ModifierDossier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<DossierMedical | null>(null);
  const [loading, setLoading] = useState(false);

  // 🟢 Charger dossier existant
  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const res = await api.get<DossierMedical>(`/dossiers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        console.error("Erreur chargement dossier :", err);
        toast.error("❌ Impossible de charger le dossier.");
      }
    };
    if (token) fetchDossier();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setLoading(true);
      await api.put(`/dossiers/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Dossier médical mis à jour !");
      navigate(`/dossiers/${id}`);
    } catch (err) {
      console.error("Erreur update dossier :", err);
      toast.error("❌ Échec de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return <div className="p-6 text-center text-gray-400">Chargement du dossier...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
      <div
        className="w-full max-w-4xl bg-white/10 dark:bg-gray-800/30 
                      backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
      >
        <h2 className="text-3xl font-extrabold text-center mb-8 text-white drop-shadow-lg">
          ✏️ Modifier le dossier médical
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Résumé */}
          <div className="md:col-span-2">
            <label htmlFor="resume" className="block text-sm mb-1 text-white">
              Résumé
            </label>
            <textarea
              id="resume"
              name="resume"
              value={formData.resume || ""}
              onChange={handleChange}
              className={`${glassInput} min-h-[80px]`}
            />
          </div>

          {/* Antécédents */}
          <div>
            <label htmlFor="antecedents" className="block text-sm mb-1 text-white">
              Antécédents
            </label>
            <textarea
              id="antecedents"
              name="antecedents"
              value={formData.antecedents || ""}
              onChange={handleChange}
              className={`${glassInput} min-h-[80px]`}
            />
          </div>

          {/* Traitements */}
          <div>
            <label htmlFor="traitements" className="block text-sm mb-1 text-white">
              Traitements
            </label>
            <textarea
              id="traitements"
              name="traitements"
              value={formData.traitements || ""}
              onChange={handleChange}
              className={`${glassInput} min-h-[80px]`}
            />
          </div>

          {/* Allergies */}
          <div>
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

          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm mb-1 text-white">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              className={`${glassInput} min-h-[80px]`}
            />
          </div>

          {/* Pathologies */}
          <div>
            <label htmlFor="pathologies" className="block text-sm mb-1 text-white">
              Pathologies
            </label>
            <input
              id="pathologies"
              name="pathologies"
              value={formData.pathologies || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Chirurgies */}
          <div>
            <label htmlFor="chirurgies" className="block text-sm mb-1 text-white">
              Chirurgies
            </label>
            <input
              id="chirurgies"
              name="chirurgies"
              value={formData.chirurgies || ""}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* Examens */}
          <div className="md:col-span-2">
            <label htmlFor="examens" className="block text-sm mb-1 text-white">
              Examens
            </label>
            <textarea
              id="examens"
              name="examens"
              value={formData.examens || ""}
              onChange={handleChange}
              className={`${glassInput} min-h-[80px]`}
            />
          </div>

          {/* Boutons */}
          <div className="col-span-2 flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-2xl font-semibold shadow-lg 
                         bg-gray-600/70 hover:bg-gray-700 text-white transition"
            >
              ⬅️ Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-2xl font-semibold shadow-lg 
                         bg-green-600/80 hover:bg-green-700/90 text-white 
                         transition backdrop-blur-md"
            >
              {loading ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierDossier;
