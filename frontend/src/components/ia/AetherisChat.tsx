import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SendHorizonal, Bot, User, Volume2, Loader2 } from "lucide-react";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

interface Message {
  role: "user" | "aetheris";
  message: string;
  created_at?: string;
  langue?: string;
}

interface AetherisChatProps {
  onLangueDetected?: (langue: string) => void;
}

const AetherisChat: React.FC<AetherisChatProps> = ({ onLangueDetected }) => {
  const { token } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [langueIA, setLangueIA] = useState("fr");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔊 Synthèse vocale améliorée selon la langue détectée
  const speak = (text: string, lang: string = "fr-FR") => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Synthèse vocale non disponible :", e);
    }
  };

  // 🧠 Charger l’historique du chat au démarrage
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/aetheris/chat/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) setMessages(res.data);
      } catch (err) {
        console.error("Erreur historique Aetheris :", err);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  // 📜 Scroll automatique vers le bas à chaque message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 💬 Envoi du message utilisateur à Aetheris
  const handleSend = async () => {
    if (!input.trim() || !token) return;

    const userMessage: Message = { role: "user", message: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setThinking(true);

    try {
      const res = await api.post(
        "/aetheris/chat/ask",
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiResponse = res.data?.aetheris_response || "Réponse vide d’Aetheris.";
      const detectedLang = res.data?.langue || "fr";

      setLangueIA(detectedLang);
      if (onLangueDetected) onLangueDetected(detectedLang);

      setMessages((prev) => [
        ...prev,
        { role: "aetheris", message: aiResponse, langue: detectedLang },
      ]);

      // 🔊 Lecture vocale automatique
      speak(aiResponse, detectedLang === "fr" ? "fr-FR" : detectedLang);
    } catch (err: any) {
      console.error("❌ Erreur Aetheris :", err);
      const msg =
        err.response?.status === 404
          ? "Aetheris IA est momentanément indisponible."
          : "⚠️ Une erreur est survenue lors de la communication avec Aetheris.";
      toast.error(msg);
    } finally {
      setThinking(false);
    }
  };

  // 💭 Animation de réflexion
  const TypingIndicator = () => (
    <motion.div
      className="flex gap-1 items-center text-cyan-300 mt-2"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.2 }}
    >
      <span className="w-2 h-2 bg-cyan-400 rounded-full" />
      <span className="w-2 h-2 bg-cyan-300 rounded-full" />
      <span className="w-2 h-2 bg-cyan-200 rounded-full" />
    </motion.div>
  );

  return (
    <section
      className="relative w-full max-w-4xl mx-auto rounded-3xl p-8 
      bg-gradient-to-br from-[#0b0f19]/90 via-[#0e1425]/80 to-[#0a0d1a]/90 
      border border-cyan-500/20 backdrop-blur-2xl shadow-[0_0_40px_#0891b280] text-gray-100"
      aria-label="Interface de discussion avec Aetheris IA"
    >
      {/* 🧠 En-tête */}
      <header className="flex items-center justify-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <Bot
            size={36}
            className="text-cyan-400 drop-shadow-[0_0_10px_#06b6d4]"
            aria-hidden="true"
          />
          <h2
            id="chat-title"
            className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent"
          >
            Dialogue Cognitif AETHERIS
          </h2>
        </motion.div>
      </header>

      {/* 💬 Fenêtre de messages */}
      <div
        className="h-[480px] overflow-y-auto pr-2 space-y-6 custom-scrollbar"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-400 italic mt-10">
            💠 Commencez une conversation avec Aetheris, votre IA médicale connectée.
          </p>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] p-4 rounded-2xl shadow-md backdrop-blur-xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white border border-white/10"
                  : "bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-gray-800/80 text-cyan-100 border border-cyan-400/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {msg.role === "aetheris" ? (
                  <Bot size={18} className="text-cyan-400" />
                ) : (
                  <User size={18} className="text-indigo-300" />
                )}
                <span className="font-semibold">
                  {msg.role === "aetheris" ? "Aetheris IA" : "Vous"}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.message}</p>
            </div>
          </motion.div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="p-4 bg-gray-800/50 rounded-2xl text-indigo-200">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 🧭 Zone de saisie */}
      <form
        className="mt-6 flex items-center gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        aria-labelledby="chat-title"
      >
        <input
          id="user-input"
          type="text"
          placeholder="Posez une question à Aetheris..."
          className="flex-1 p-4 rounded-2xl bg-white/10 border border-cyan-500/30 
          text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Saisir un message"
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={thinking}
          aria-label="Envoyer le message"
          title="Envoyer"
          onClick={handleSend}
          className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 
          text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          {thinking ? (
            <Loader2 className="animate-spin" size={20} aria-hidden="true" />
          ) : (
            <SendHorizonal size={22} aria-hidden="true" />
          )}
        </motion.button>
      </form>

      {/* 🔊 Présentation vocale */}
      <div className="text-center mt-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          aria-label="Lire la présentation d’Aetheris"
          title="Lire la présentation d’Aetheris"
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mx-auto text-sm font-medium transition"
          onClick={() =>
            speak(
              "Bonjour, je suis Aetheris. Je comprends plusieurs langues et je suis connectée à votre base médicale en temps réel.",
              langueIA === "fr" ? "fr-FR" : langueIA
            )
          }
        >
          <Volume2 size={18} aria-hidden="true" />
          Lire la présentation d’Aetheris
        </motion.button>
      </div>
    </section>
  );
};

export default AetherisChat;
