import api from "./api";

export const fetchRendezVous = async () => {
  const response = await api.get("/rendezvous/");
  return response.data;
};

export const createRendezVous = async (rendezVousData: any) => {
  const response = await api.post("/rendezvous/", rendezVousData);
  return response.data;
};

export const deleteRendezVous = async (id: number) => {
  const response = await api.delete(`/rendezvous/${id}`);
  return response.data;
};
