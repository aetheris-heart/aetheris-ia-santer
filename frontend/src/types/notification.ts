// frontend/src/types/notification.ts
export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: "info" | "alerte" | "critique";
  lu: boolean;
  user_id: number;
  created_at: string;
}
