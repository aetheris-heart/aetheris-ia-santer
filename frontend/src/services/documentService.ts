import api from "./api";

export const uploadDocument = async (patientId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/documents/upload/${patientId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const fetchDocumentsByPatient = async (patientId: number) => {
  const response = await api.get(`/documents/${patientId}`);
  return response.data;
};
