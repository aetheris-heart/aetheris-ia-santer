import React, { type ReactNode, type ButtonHTMLAttributes } from "react";
import { UIHeader, UIAlert, UILoader } from "@/components/uui";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost"; // 👈 ajoute ghost ici
  className?: string;
}

export function UIButton({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-700 text-white hover:bg-blue-800",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    ghost: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
