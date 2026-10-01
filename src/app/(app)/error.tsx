"use client";

import { Gagal } from "@/components/states";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <Gagal apa="Data modul ini" onCoba={reset} />;
}
