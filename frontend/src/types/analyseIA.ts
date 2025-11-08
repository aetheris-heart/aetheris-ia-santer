// frontend/src/types/analyseIA.ts
export interface AnalyseIA {
  id: number;
  patient_id: number;
  description: string;
  observations?: string;
  score?: number;
  type_analyse?: string;
  created_at: string;
  disclaimer?: string;

  patient?: {
    id: number;
    nom: string;
    prenom: string;
    age?: number;
    sexe?: string;
  };
}
