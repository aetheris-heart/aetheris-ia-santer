import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

const AetherisMonitoring: React.FC = () => {
  const { token } = useUser();
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    const fetchMonitoring = async () => {
      try {
        const res = await api.get("/aetheris/monitoring", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Erreur monitoring :", err);
      }
    };
    if (token) fetchMonitoring();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-black text-white p-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-teal-300 to-cyan-400 text-transparent bg-clip-text"
      >
        🩺 Surveillance Continue
      </motion.h1>

      <div className="max-w-5xl mx-auto bg-white/10 border border-cyan-500/30 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <Activity className="text-cyan-400" size={48} />
          <div>
            <h2 className="text-2xl font-bold">Flux de données vitales</h2>
            <p className="text-gray-400 text-sm">Analyse en temps réel</p>
          </div>
        </div>

        {data ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6 text-center">
            {Object.entries(data).map(([k, v], i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-black/30 rounded-xl p-4 border border-cyan-600/20"
              >
                <p className="text-sm text-gray-400">{k}</p>
                <p className="text-2xl font-bold text-cyan-300">{v}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Lecture des données en cours...</p>
        )}
      </div>
    </div>
  );
};

export default AetherisMonitoring;
