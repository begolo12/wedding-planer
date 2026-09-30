"use client";

import { Gagal } from "@/components/states";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ padding: "48px 16px", maxWidth: 600, margin: "0 auto" }}>
      <Gagal apa="Halaman" onCoba={reset} />
    </main>
  );
}
