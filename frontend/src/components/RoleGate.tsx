import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext"; // ✅ Remplacement correct

/** Adapte ici si tu as plus de rôles */
export type Role = "admin" | "medecin" | "infirmier";

/** Utilitaire: vérifie les rôles d'un user selon la stratégie */
function checkRoles(userRole: string | undefined, required: Role[], requireAll: boolean) {
  if (!userRole) return false;
  if (required.length === 0) return true;
  return requireAll
    ? required.every((r) => r === userRole)
    : required.some((r) => r === userRole);
}

type RoleGateProps = {
  /** Un seul rôle ou plusieurs */
  allow: Role | Role[];
  /** Exiger que *tous* les rôles listés matchent (rare). Par défaut : au moins un. */
  requireAll?: boolean;
  /** Que faire si non autorisé : "redirect" (par défaut), "fallback" ou "null" */
  whenUnauthorized?: "redirect" | "fallback" | "null";
  /** Chemin de redirection si non autorisé (par défaut /403) */
  to?: string;
  /** UI de repli (si whenUnauthorized = "fallback") */
  fallback?: ReactNode;
  /** Contenu protégé */
  children: ReactNode;
  /** Afficher un placeholder pendant le chargement de l'auth */
  loadingFallback?: ReactNode;
};

export default function RoleGate({
  allow,
  requireAll = false,
  whenUnauthorized = "redirect",
  to = "/403",
  fallback = null,
  loadingFallback = <div className="p-4">Chargement…</div>,
  children,
}: RoleGateProps) {
  const { user, loading } = useUser(); // ✅ utilisation correcte
  const loc = useLocation();

  if (loading) return <>{loadingFallback}</>;

  // pas connecté → on redirige vers login en conservant la destination
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;

  const ok = checkRoles(user.role, Array.isArray(allow) ? allow : [allow], requireAll);

  if (!ok) {
    if (whenUnauthorized === "fallback") return <>{fallback}</>;
    if (whenUnauthorized === "null") return null;
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
}

/** Petit helper réutilisable si besoin ailleurs */
export function useHasRole(allow: Role | Role[], requireAll = false) {
  const { user } = useUser(); // ✅ même logique
  const ok = checkRoles(user?.role, Array.isArray(allow) ? allow : [allow], requireAll);
  return ok;
}
