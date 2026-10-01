"use client";

import { Gagal } from "@/components/states";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="halaman-baca">
      <Gagal apa="Halaman" onCoba={reset} />
    </main>
  );
}
