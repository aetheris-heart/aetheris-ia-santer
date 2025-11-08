import React from "react";
import { Card, CardContent, UIButton, UIHeader, UILoader } from "@/components/uui";

interface AlertProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
}

export function UIAlert({ message, type = "info" }: AlertProps) {
  const colors = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
  };

  return <div className={`p-3 rounded-lg ${colors[type]} shadow`}>{message}</div>;
}
