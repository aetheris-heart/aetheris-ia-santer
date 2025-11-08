// src/components/AdminRoute.tsx
import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { UILoader } from "@/components/uui";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useUser();

  if (loading) return <UILoader />; // ⏳ Attente

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />; // 🚫 pas admin → renvoie dashboard
  }

  return children;
};

export default AdminRoute;
