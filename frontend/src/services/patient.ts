// frontend/src/services/patient.ts
import api from "./api";
import type { Patient } from "@/types";

export const PatientService = {
  async list(): Promise<Patient[]> {
    const res = await api.get("/patients");
    return res.data;
  },

  async detail(id: number): Promise<Patient> {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },

  async create(data: Partial<Patient>): Promise<Patient> {
    const res = await api.post("/patients", data);
    return res.data;
  },

  async update(id: number, data: Partial<Patient>): Promise<Patient> {
    const res = await api.put(`/patients/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const res = await api.delete(`/patients/${id}`);
    return res.data;
  },
};
