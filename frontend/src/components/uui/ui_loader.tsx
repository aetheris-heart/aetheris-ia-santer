import React from "react";
import { Card, CardContent, UIButton, UIHeader, UIAlert } from "@/components/uui";

export function UILoader() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-700"></div>
    </div>
  );
}
