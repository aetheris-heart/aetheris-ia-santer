import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/context/UserContext";

interface VitalSigns {
  spo2?: number;
  rythme_cardiaque?: number;
  température?: number;
}

export const usePatientRealtime = (patientId: number) => {
  const { token } = useUser();
  const [data, setData] = useState<VitalSigns>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const res = await axios.get<VitalSigns>(
          `http://localhost:8000/patients/${patientId}/etat`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(res.data);
      } catch (error) {
        console.error("Erreur récupération données temps réel :", error);
      } finally {
        setLoading(false);
      }
    };

    if (token && patientId) {
      fetchVitals();
      const interval = setInterval(fetchVitals, 5000);
      return () => clearInterval(interval);
    }
  }, [token, patientId]);

  return { data, loading };
};
