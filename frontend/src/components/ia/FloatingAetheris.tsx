import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Bot } from "lucide-react";

const FloatingAetheris: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "aetheris",
      text: "Bienvenue dans l'interface cosmique. Que souhaites-tu explorer ?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");

    // Simu de réponse IA
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "aetheris",
          text: `🔮 Aetheris analyse... Résultat : ${input.length % 2 === 0 ? "stable" : "anomalie détectée"}.`,
        },
      ]);
    }, 1200);
  };

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-4 rounded-full shadow-lg z-50 hover:scale-110 transition-all"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Sparkles className="animate-pulse" />
      </motion.button>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-6 w-96 max-w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-purple-600"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-700 to-purple-800 text-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 animate-pulse" />
                <span className="font-semibold">Aetheris</span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-80 custom-scrollbar">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`text-sm px-3 py-2 rounded-xl max-w-[80%] ${
                    msg.from === "aetheris"
                      ? "bg-indigo-100 dark:bg-indigo-800 text-gray-800 dark:text-white self-start"
                      : "bg-purple-200 dark:bg-purple-700 text-gray-900 dark:text-white self-end ml-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                className="flex-1 px-4 py-2 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                placeholder="Parle à Aetheris..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
              >
                Envoyer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAetheris;
