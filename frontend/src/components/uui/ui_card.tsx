import React, { type ReactNode, type HTMLAttributes } from "react";
import { UIButton, UIHeader, UIAlert, UILoader } from "@/components/uui";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={`bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl transition-all duration-300 ease-in-out ${className}`}
    >
      {children}
    </div>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "", ...rest }: CardContentProps) {
  return (
    <div {...rest} className={`p-6 text-gray-800 dark:text-gray-100 ${className}`}>
      {children}
    </div>
  );
}
