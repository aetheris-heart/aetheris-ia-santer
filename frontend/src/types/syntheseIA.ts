import type { ReactNode } from "react";

export interface Alerte {
  id: number;
  type: string;
  message: string;
  niveau: string; // ex: critique, modérée
}

export interface Anomalie {
  id: number;
  organe: string;
  message: string;
}

export interface Recommandation {
  id: number;
  contenu: string;
}

export interface PatientSynthese {
  id: number;
  nom: string;
  prenom: string;
  igr: number; // Indice Global de Risque
  tendance: string; // ex: "stable", "en hausse", "en baisse"
}

export interface SyntheseIA {
  prenom: ReactNode;
  nom: ReactNode;
  id?: number;
  patient_id?: number;
  resume: string;
  recommandations?: string;
  risques?: string;
  score_global?: number;
  tags?: string;
  created_at?: string;

  // Ajouts frontend
  igr?: number;
  tendance?: string;

  // Relations détaillées
  patient?: {
    id: number;
    nom: string;
    prenom: string;
    age?: number;
    sexe?: string;
  };

  // Sous-sections
  alertes?: Alerte[];
  anomalies?: Anomalie[];
  recommandations_list?: Recommandation[];
}
