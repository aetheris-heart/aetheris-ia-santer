import React from "react";
import { NavLink } from "react-router-dom";

const Navigation: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded hover:bg-blue-200 transition ${
      isActive ? "bg-blue-500 text-white" : "text-blue-700"
    }`;

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">IA Santé</h1>
      <div className="flex gap-4">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/patients" className={linkClass}>
          Patients
        </NavLink>
        <NavLink to="/consultations" className={linkClass}>
          Consultations
        </NavLink>
        <NavLink to="/diagnostic" className={linkClass}>
          Diagnostic
        </NavLink>
        <NavLink to="/dossiers" className={linkClass}>
          Dossiers
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
