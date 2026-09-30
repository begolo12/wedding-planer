"use client";

import { useState, useEffect, useCallback } from "react";
import { useMuat } from "./use-muat";
import type { plans } from "@/db/schema";

export type Plan = typeof plans.$inferSelect;

const KUNCI_PLAN_AKTIF = "pernikahan_plan_aktif";

/**
 * Mengambil plan aktif milik pengguna saat ini.
 * Memakai plan yang dipilih di penyimpanan lokal atau plan pertama.
 */
export function usePlan() {
  const { data, memuat, galat, muatUlang } = useMuat<{ plans: Plan[] }>("/api/plans");
  const [dipilihId, setDipilihId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tersimpan = localStorage.getItem(KUNCI_PLAN_AKTIF);
      if (tersimpan) setDipilihId(tersimpan);
    }
  }, []);

  const daftar = data?.plans ?? [];
  const plan =
    daftar.find((p) => p.id === dipilihId) ??
    daftar[0] ??
    null;

  const pilihPlan = useCallback((id: string) => {
    setDipilihId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(KUNCI_PLAN_AKTIF, id);
    }
  }, []);

  return {
    plan,
    planId: plan?.id ?? null,
    memuat,
    galat,
    muatUlang,
    daftarPlan: daftar,
    pilihPlan,
  };
}
