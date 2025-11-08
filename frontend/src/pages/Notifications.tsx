// frontend/src/pages/Notifications.tsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import { getUserNotifications, markNotificationAsRead } from "@/services/notification";
import type { Notification } from "@/types/notification";

const Notifications: React.FC = () => {
  const { token } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger les notifications
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const data = await getUserNotifications(token);
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          console.warn("Réponse inattendue de l’API notifications:", data);
          setNotifications([]);
        }
      } catch (err) {
        toast.error("❌ Impossible de charger les notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // ✅ Marquer comme lue (basé sur backend + maj locale)
  const handleMarkAsRead = async (id: number) => {
    if (!token) {
      toast.error("⚠️ Non autorisé, veuillez vous reconnecter");
      return;
    }

    try {
      const updated = await markNotificationAsRead(id, token);

      if (updated && typeof updated === "object") {
        // ⚡ On fusionne la notif mise à jour
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
      } else {
        // 🔁 Fallback si backend ne renvoie rien → juste mettre lu=true
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
      }

      toast.success("✅ Notification marquée comme lue");
    } catch (err) {
      console.error("Erreur markAsRead:", err);
      toast.error("❌ Impossible de marquer la notification comme lue");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-400">⏳ Chargement des notifications...</div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-transparent backdrop-blur-xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">🔔 Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Aucune notification pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`p-4 rounded-xl shadow-md transition ${
                n.lu ? "bg-gray-200 dark:bg-gray-700 opacity-70" : "bg-white/50 dark:bg-gray-800/60"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{n.titre}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {!n.lu && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Marquer comme lue
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
