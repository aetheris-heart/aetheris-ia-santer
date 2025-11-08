import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, AlertTriangle } from "lucide-react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";

const AetherisReactive: React.FC = () => {
  const { token } = useUser();
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    const fetchReactive = async () => {
      try {
        const res = await api.get("/aetheris/reactive", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActions(res.data.actions || []);
      } catch (err) {
        console.error("Erreur reactive :", err);
      }
    };
    if (token) fetchReactive();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-black text-white p-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-yellow-300 to-orange-400 text-transparent bg-clip-text"
      >
        ⚡ Réponses Instantanées
      </motion.h1>

      <div className="max-w-5xl mx-auto bg-white/10 border border-yellow-500/30 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <Zap className="text-yellow-400" size={48} />
          <div>
            <h2 className="text-2xl font-bold">Actions Automatiques</h2>
            <p className="text-gray-400 text-sm">Réponses IA aux situations critiques</p>
          </div>
        </div>

        {actions.length > 0 ? (
          <ul className="space-y-4">
            {actions.map((a, i) => (
              <motion.li
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-black/30 border border-yellow-600/30 rounded-xl p-4 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-yellow-400" />
                  <p className="font-semibold">{a.title}</p>
                </div>
                <p className="text-sm text-gray-400 mt-1">{a.description}</p>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">Aucune action déclenchée pour l’instant.</p>
        )}
      </div>
    </div>
  );
};

export default AetherisReactive;
