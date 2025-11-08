// frontend/src/services/syntheseIA.ts
import api from "./api";
import type { SyntheseIA } from "@/types";

export const SyntheseIAService = {
  async list(): Promise<SyntheseIA[]> {
    const res = await api.get("/synthese-ia");
    return res.data;
  },

  async byPatient(patientId: number): Promise<SyntheseIA> {
    const res = await api.get(`/synthese-ia/${patientId}`);
    return res.data;
  },

  async create(patientId: number, data: Partial<SyntheseIA>): Promise<SyntheseIA> {
    const res = await api.post(`/synthese-ia/${patientId}`, data);
    return res.data;
  },
};
