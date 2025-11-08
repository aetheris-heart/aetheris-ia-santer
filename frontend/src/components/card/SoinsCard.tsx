import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/components/lib/axios";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/uui/ui_card";
import { FaBriefcaseMedical, FaChevronRight, FaExclamationTriangle } from "react-icons/fa";

interface SoinsStatsAny {
  [k: string]: unknown;
  totalSoins?: number;
  total_soins?: number;
  total?: number;
  soinsAujourdHui?: number;
  aujourdhui?: number;
  today?: number;
}

interface SoinsCardProps {
  title?: string;
  to?: string; // Route de destination au clic
}

const SoinsCard: React.FC<SoinsCardProps> = ({ title = "Soins infirmiers", to }) => {
  const { token } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [totalSoins, setTotalSoins] = useState(0);
  const [todaySoins, setTodaySoins] = useState(0);

  const asNumber = (v: unknown): number | undefined =>
    typeof v === "number" && Number.isFinite(v) ? v : undefined;

  const formatInt = (n: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const fetchSoins = async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await api.get<SoinsStatsAny>("/dashboard/stats/soins-infirmiers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const d = (res?.data ?? {}) as SoinsStatsAny;

        const total = asNumber(d.totalSoins) ?? asNumber(d.total_soins) ?? asNumber(d.total) ?? 0;

        const today =
          asNumber(d.soinsAujourdHui) ?? asNumber(d.aujourdhui) ?? asNumber(d.today) ?? 0;

        if (!cancelled) {
          setTotalSoins(total);
          setTodaySoins(today);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(
            e?.response?.status ? `Erreur ${e.response.status}` : e?.message || "Erreur réseau"
          );
          setTotalSoins(0);
          setTodaySoins(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSoins();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const goTo = useCallback(() => {
    navigate(to ?? "/soins");
  }, [navigate, to]);

  const stats = useMemo(
    () => [
      { label: "Total", value: totalSoins },
      { label: "Aujourd’hui", value: todaySoins },
    ],
    [totalSoins, todaySoins]
  );

  return (
    <Card
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 
                 dark:from-gray-900 dark:to-gray-950 hover:shadow-xl transition-all cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={goTo}
      aria-label="Ouvrir le module Soins infirmiers"
    >
      {/* Glow décoratif */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl" />

      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-1">
            <div className="h-12 w-12 grid place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
              <FaBriefcaseMedical className="text-emerald-600 dark:text-emerald-400 text-xl" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h3>
              <FaChevronRight className="opacity-70" />
            </div>

            {loading ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="h-16 rounded-xl bg-gray-200/70 dark:bg-gray-800/70 animate-pulse" />
                <div className="h-16 rounded-xl bg-gray-200/70 dark:bg-gray-800/70 animate-pulse" />
              </div>
            ) : err ? (
              <div className="mt-3 flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                <FaExclamationTriangle className="mt-0.5 shrink-0" />
                <p className="leading-snug">{err}</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-3 bg-white/70 dark:bg-gray-900/60"
                  >
                    <div className="text-xs text-gray-500">{s.label}</div>
                    <div className="text-2xl font-semibold">{formatInt(s.value)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 underline-offset-4">
              Accéder au module
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoinsCard;
