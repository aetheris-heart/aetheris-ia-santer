import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Style glass input

const glassInput =
  "w-full px-4 py-3 rounded-xl bg-gray-800/40 dark:bg-gray-700/40 backdrop-blur-md border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 outline-none transition";
interface CreatedPatient {
  id: number;
  nom: string;
}

const AjouterPatient: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useUser();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    sexe: "",
    date_naissance: "",
    age: "",
    email: "",
    telephone: "",
    adresse: "",
    contact_urgence: "",
    relation_contact: "",
    groupe_sanguin: "",
    allergies: "",
    antecedents: "",
    traitement: "",
    pathologie: "",
    temperature: "",
    rythme_cardiaque: "",
    spo2: "",
    frequence_respiratoire: "",
    tension_systolique: "",
    tension_diastolique: "",
    poids: "",
    taille: "",
    statut_clinique: "Stable",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("🔒 Vous devez être connecté pour ajouter un patient.");
      return;
    }

    const champsRequis = ["nom", "prenom", "date_naissance", "sexe"];
    for (const champ of champsRequis) {
      if (!formData[champ as keyof typeof formData]) {
        toast.warning(`⚠️ Le champ "${champ}" est requis.`);
        return;
      }
    }

    try {
      setLoading(true);

      // 🔹 Conversion propre des types numériques
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        rythme_cardiaque: formData.rythme_cardiaque ? parseFloat(formData.rythme_cardiaque) : null,
        spo2: formData.spo2 ? parseFloat(formData.spo2) : null,
        frequence_respiratoire: formData.frequence_respiratoire
          ? parseFloat(formData.frequence_respiratoire)
          : null,
        tension_systolique: formData.tension_systolique
          ? parseFloat(formData.tension_systolique)
          : null,
        tension_diastolique: formData.tension_diastolique
          ? parseFloat(formData.tension_diastolique)
          : null,
        poids: formData.poids ? parseFloat(formData.poids) : null,
        taille: formData.taille ? parseFloat(formData.taille) : null,
      };

      // 🔸 Nettoyage des champs vides
      const cleanedPayload: Record<string, any> = {};
      Object.entries(payload).forEach(([key, value]) => {
        cleanedPayload[key] = value === "" ? null : value;
      });

      // 🔹 Envoi API
      const response = await api.post<CreatedPatient>("/patients", cleanedPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Patient enregistré avec succès !");
      navigate(`/dossiers/${response.data.id}`);
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du patient :", error.response?.data ?? error);
      toast.error("❌ Échec de l'enregistrement. Vérifiez les champs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 p-6">
      <div className="w-full max-w-4xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900 dark:text-white drop-shadow-md">
          📝 Enregistrement d’un nouveau patient
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label htmlFor="nom" className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
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
            <label htmlFor="prenom" className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
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
            <label
              htmlFor="date_naissance"
              className="block text-sm mb-1 text-gray-700 dark:text-gray-200"
            >
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
            <label htmlFor="sexe" className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
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
            <label htmlFor="age" className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
              Âge
            </label>
            <input
              id="age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={glassInput}
            />
          </div>

          {/* --- CONTACT --- */}
          <h3 className="md:col-span-2 text-xl font-bold text-indigo-400">Contact</h3>
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="adresse"
            placeholder="Adresse"
            value={formData.adresse}
            onChange={handleChange}
            className={`${glassInput} md:col-span-2`}
          />
          <input
            name="contact_urgence"
            placeholder="Contact d’urgence"
            value={formData.contact_urgence}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="relation_contact"
            placeholder="Relation (ex : mère, frère…)"
            value={formData.relation_contact}
            onChange={handleChange}
            className={glassInput}
          />

          {/* --- MÉDICAL --- */}
          <h3 className="md:col-span-2 text-xl font-bold text-indigo-400">
            Informations médicales
          </h3>
          <input
            name="groupe_sanguin"
            placeholder="Groupe sanguin"
            value={formData.groupe_sanguin}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="pathologie"
            placeholder="Pathologie principale"
            value={formData.pathologie}
            onChange={handleChange}
            className={glassInput}
          />
          <textarea
            name="allergies"
            placeholder="Allergies"
            value={formData.allergies}
            onChange={handleChange}
            className={`${glassInput} md:col-span-2`}
          />
          <textarea
            name="antecedents"
            placeholder="Antécédents médicaux"
            value={formData.antecedents}
            onChange={handleChange}
            className={`${glassInput} md:col-span-2`}
          />
          <textarea
            name="traitement"
            placeholder="Traitement en cours"
            value={formData.traitement}
            onChange={handleChange}
            className={`${glassInput} md:col-span-2`}
          />

          {/* --- CONSTANTES --- */}
          <h3 className="md:col-span-2 text-xl font-bold text-indigo-400">Constantes vitales</h3>
          <input
            name="temperature"
            type="number"
            step="0.1"
            placeholder="Température (°C)"
            value={formData.temperature}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="rythme_cardiaque"
            type="number"
            placeholder="Rythme cardiaque (bpm)"
            value={formData.rythme_cardiaque}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="spo2"
            type="number"
            step="0.1"
            placeholder="SpO₂ (%)"
            value={formData.spo2}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="frequence_respiratoire"
            type="number"
            placeholder="Fréquence respiratoire"
            value={formData.frequence_respiratoire}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="tension_systolique"
            type="number"
            placeholder="Tension systolique"
            value={formData.tension_systolique}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="tension_diastolique"
            type="number"
            placeholder="Tension diastolique"
            value={formData.tension_diastolique}
            onChange={handleChange}
            className={glassInput}
          />

          {/* --- MORPHO --- */}
          <h3 className="md:col-span-2 text-xl font-bold text-indigo-400">Morphologie</h3>
          <input
            name="poids"
            type="number"
            placeholder="Poids (kg)"
            value={formData.poids}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="taille"
            type="number"
            placeholder="Taille (cm)"
            value={formData.taille}
            onChange={handleChange}
            className={glassInput}
          />
          <input
            name="imc"
            type="number"
            placeholder="IMC"
            value={formData.imc}
            onChange={handleChange}
            className={glassInput}
          />

          {/* --- OBSERVATIONS --- */}
          <h3 className="md:col-span-2 text-xl font-bold text-indigo-400">Observations</h3>
          <select
            name="etat_conscience"
            value={formData.etat_conscience}
            onChange={handleChange}
            className={glassInput}
          >
            <option value="">État de conscience</option>
            <option value="Normal">Normal</option>
            <option value="Somnolent">Somnolent</option>
            <option value="Inconscient">Inconscient</option>
          </select>
          <input
            name="douleur"
            type="number"
            placeholder="Douleur (0-10)"
            value={formData.douleur}
            onChange={handleChange}
            className={glassInput}
          />
          <textarea
            name="observation_medecin"
            placeholder="Observation du médecin"
            value={formData.observation_medecin}
            onChange={handleChange}
            className={`${glassInput} md:col-span-2`}
          />
          <textarea
            name="observation_infirmiere"
            placeholder="Observation infirmière"
            value={formData.observation_infirmiere}
            onChange={handleChange}
            className={`${glassInput} md:col-span-2`}
          />

          {/* Bouton */}
          <div className="col-span-2 text-right mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-2xl font-semibold shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition transform hover:scale-105 backdrop-blur-md"
            >
              {loading ? "⏳ Enregistrement..." : "✅ Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterPatient;
