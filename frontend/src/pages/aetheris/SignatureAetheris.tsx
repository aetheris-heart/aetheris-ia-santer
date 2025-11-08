import React from "react";
import { motion } from "framer-motion";

const SignatureAetheris: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-lg mt-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-4xl font-bold mb-4"
      >
        🔐 Signature Aetheris IA
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "80%" }}
        transition={{ duration: 2 }}
        className="h-1 bg-white mb-4"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="text-center text-sm italic"
      >
        "Document certifié par l'Intelligence Médicale Aetheris."
      </motion.p>
    </div>
  );
};

export default SignatureAetheris;
