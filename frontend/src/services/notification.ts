import api from "@/components/lib/axios";
import type { Notification } from "@/types";

// 🔄 Charger toutes les notifications de l’utilisateur
export async function getUserNotifications(token: string): Promise<Notification[]> {
  const res = await api.get<Notification[]>("/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ✅ Marquer comme lue
export async function markNotificationAsRead(id: number, token: string): Promise<Notification> {
  const res = await api.put<Notification>(`/notifications/${id}/read`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// 📩 Supprimer une notification
export async function deleteNotification(id: number, token: string): Promise<void> {
  await api.delete(`/notifications/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
