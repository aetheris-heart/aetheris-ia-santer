import type { ReactNode } from "react";

// Dashboard
export interface DashboardStats {
  patients: number;
  dossiers: number;
  consultations: number;
  diagnostics: number;
  rendezvous: number;
}

// Graphique patients par mois
export interface PatientStats {
  mois: string; // ex: "Janvier"
  total: number;
}

// Patient
export interface Patient {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  sexe: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  groupe_sanguin?: string;
  allergies?: string;
  antecedents?: string;
  date_enregistrement: string;
}

// Diagnostic
export interface Diagnostic {
  id: number;
  patient_id: number;
  medecin_id: number;
  description: string;
  conclusion: string;
  suggestion_ia: string;
  date_creation: string;
}

// Consultation
export interface Consultation {
  id: number;
  patient_id: number;
  medecin_id: number;
  date: string;
  motif: string;
  notes: string;
}

// Rendez-vous
export interface RendezVous {
  id: number;
  patient_id: number;
  date: string;
  heure: string;
  statut: "en attente" | "confirmé" | "annulé";
  commentaire?: string;
}

// Pulmonary stats
export interface PulmonaryStats {
  spo2: number;
  respiration_rate: number;
  history: { time: string; spo2: number }[];
  zone_infectee?: string;
}

// --- Radiologie ---
export type Modality = "XR" | "CT" | "MR" | "US" | "NM" | "MG" | "DX" | string;

export interface Study {
  id: number;
  modality: Modality;
  description?: string;
  date: string; // ISO
  image_count?: number;
  findings?: string;
  impression?: string;
  preview_url?: string; // miniature si dispo
}

export interface ConsultationIA {
  motif: string;
  diagnostic: string;
  date?: string; // ✅ optionnelle
  pertinence?: number; // ✅ optionnelle aussi
}

export interface NeurologiqueData {
  id: number;
  patient_id: number;
  eeg?: number; // Activité électrique cérébrale
  stress_level?: number; // Niveau de stress (0-100)
  concentration?: number; // Concentration cognitive
  reponse_reflexe?: number; // Temps de réponse moyen (ms)
  temperature_cerebrale?: number; // Température du cerveau en °C
  alerte?: string; // Message IA
  commentaire_ia?: string; // Analyse d’Aetheris IA
  created_at: string;
  updated_at: string;
}
// =====================================
// 📦 Réponses API Neurologique
// =====================================

export interface NeurologiqueResponse {
  status: string;
  message?: string;
  data: NeurologiqueData;
}

export interface NeurologiqueListResponse {
  status: string;
  count: number;
  data: NeurologiqueData[];
}

export interface NeurologiqueAnalysisResponse {
  status: string;
  patient_id: number;
  eeg_moyen: number;
  stress_moyen: number;
  diagnostic: string;
}

// Renal stats
export interface RenalStats {
  average_creatinine: number;
  average_urea: number;
  patient_count: number;
}

// Metabolic stats
export interface MetabolicStats {
  glucose: number;
  insulin: number;
  history: { time: string; glucose: number }[];
}

// Digestive stats
export interface DigestiveStats {
  total_diagnostics: number;
  date: string;
}

// Neurological stats
export interface NeurologicalStats {
  eeg: number;
  stress_level: number;
  history: { time: string; eeg: number }[];
}

export interface PatientCritique {
  risk_score: ReactNode;
  critere_temp: ReactNode;
  critere_spo2: ReactNode;
  critere_cardiaque: ReactNode;
  prenom: ReactNode;
  id: number;
  nom: string;
  alerte: string;
  rythme_cardiaque?: number;
  spo2?: number;
  température?: number;
  traitement?: string;
  derniere_consultation?: string;
  age?: number; // ✅ Ajoute ceci
}
export interface TokenResponse {
  access_token: string;
  token_type: string;
}
export interface RenalData {
  id: number;
  creatinine: number;
  urea: number;
  patient_id: number;
  created_at: string;
}

export interface Pharmacie {
  id: number;
  nom: string;
  dosage: string;
  forme: string;
  stock: number;
  fournisseur: string;
  date_expiration: string;
}

export interface Urgence {
  id: number;
  nom_patient: string;
  description: string;
  gravite: "Légère" | "Modérée" | "Sévère";
  statut: "En attente" | "Pris en charge" | "Transféré" | "Terminé";
  date: string; // format ISO date
}
export interface Ambulance {
  id: number;
  code_ambulance: string;
  chauffeur: string;
  statut: string;
  localisation?: string;
  derniere_intervention: string;
}

// src/types.ts

export interface RH {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  sexe?: string;
  date_naissance?: string; // ⚠️ en string car JSON => ISO date
  poste?: string;
  role: string;
  service?: string;
  type_contrat?: string;
  niveau_etude?: string;
  experience?: number;
  salaire?: number;
  prime?: number;
  devise?: string;
  iban?: string;
  assurance_sante?: string;
  statut?: string;
  date_embauche: string;
  date_sortie?: string;
  motif_sortie?: string;
  manager_id?: number;
  photo_url?: string;
}

export interface Hospitalisation {
  pdf_url: any;
  id: number;
  patient_id: number;
  nom: string;
  prenom: string;
  chambre: string;
  motif: string;
  date_entree: string;
  date_sortie?: string;
  medecin: string;
  etat: string; // stable | critique | surveillé
}

// =============================
// 📄 Factures
// =============================
export interface Facture {
  medecin: any;
  id: number;
  numero_facture: string;

  patient_id: number;
  medecin_id?: number | null;

  montant_ht: number;
  taxe: number;
  montant_total: number;

  statut: "en attente" | "payée" | "partiel" | "annulée";
  methode_paiement?: string | null;
  reference_paiement?: string | null;

  description?: string | null;
  notes_internes?: string | null;

  date_emission: string;
  date_echeance?: string | null;
  date_paiement?: string | null;

  // Relations minimales
  patient?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export interface Comptabilite {
  date_operation: string | number | Date;
  intitule: ReactNode;
  id: number;
  type: "revenu" | "depense";
  montant: number;
  description: string;
  date: string;
}

export interface FinanceEntry {
  id: number;
  type: "revenu" | "depense";
  montant: number;
  description?: string;
  date_operation: string;
}
export interface BlocOperatoire {
  id: number;
  nom_bloc: string;
  type_intervention: string;
  chirurgien: string;
  date_operation: string;
  statut: "programmé" | "en cours" | "terminé";
  description?: string; // ✅ optionnel
  patient_id: number;
}
export interface AnalyseBloc {
  complications: string;
  recommandations: string;
  stats_chirurgien: {
    taux_reussite: number;
    nombre_operations: number;
    complications_moyennes: number;
  };
}

export interface AnalyseBlocData {
  complications: string[];
  recommandations: string[];
  statistiques: {
    taux_succès: number;
    temps_moyen_operation: string;
    recuperation_moyenne: string;
  };
}
export interface SoinInfirmier {
  infirmier: ReactNode;
  observations: string;
  type_soin: ReactNode;
  id: number;
  patient_id: number;
  description: string;
  date_soin: string;
}

export interface DemandeCompte {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
}
export interface Specialite {
  id: number;
  nom: string;
  couleur?: string;
  icone?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConnectedUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "medecin" | "admin" | "infirmier" | "radiologue" | "secretaire" | string;
  specialite?: string | Specialite | null; // 👈 ici le vrai fix
  photo_url?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  token?: string;
}

// --- Notification ---
export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: "info" | "alerte" | "critique";
  lu: boolean;
  user_id: number;
  created_at: string; // ISO date
}

// --- Analyse IA ---
export interface AnalyseIA {
  id: number;
  patient_id: number;
  diagnostic: string;
  prediction?: string;
  plan?: string;
  recommendation?: string;
  disclaimer?: string;
  created_at: string;
}

// --- Synthèse IA ---
export interface SyntheseIA {
  id: number;
  patient_id: number;
  resume: string;
  recommandations?: string;
  risques?: string;
  score_global?: number; // 0.0 → 1.0
  tags?: string; // ex: "cardio,urgence"
  created_at: string;
}

// Alias souvent utilisé dans le projet
export type User = ConnectedUser;
