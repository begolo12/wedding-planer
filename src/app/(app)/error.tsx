"use client";

import { Gagal } from "@/components/states";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "32px 0" }}>
      <Gagal apa="Data modul ini" onCoba={reset} />
    </div>
  );
}
