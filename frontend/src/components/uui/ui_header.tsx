import React, { type ReactNode } from "react";
import { Card, CardContent, UIButton, UIAlert, UILoader } from "@/components/uui";

interface HeaderProps {
  title: string;
  actions?: ReactNode;
}

export function UIHeader({ title, actions }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      {actions}
    </div>
  );
}
