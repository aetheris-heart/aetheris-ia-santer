// frontend/src/services/analyseIA.ts
import api from "./api";
import type { AnalyseIA } from "@/types";

export const AnalyseIAService = {
  async create(patientId: number, data: Partial<AnalyseIA>): Promise<AnalyseIA> {
    const res = await api.post(`/analyse-ia/${patientId}`, data);
    return res.data;
  },

  async latest(patientId: number): Promise<AnalyseIA> {
    const res = await api.get(`/analyse-ia/${patientId}/latest`);
    return res.data;
  },

  async history(patientId: number): Promise<AnalyseIA[]> {
    const res = await api.get(`/analyse-ia/${patientId}`);
    return res.data;
  },

  async delete(analyseId: number): Promise<{ message: string }> {
    const res = await api.delete(`/analyse-ia/${analyseId}`);
    return res.data;
  },
};
