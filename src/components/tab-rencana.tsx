"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Tab modul di seluruh payung Rencana.
 * Bergulir mendatar di HP, target sentuh 44x44px.
 */
export function TabRencana() {
  const pathname = usePathname();

  const tabList = [
    { href: "/rencana", label: "Tugas" },
    { href: "/rencana/tanggal", label: "Tanggal penting" },
    { href: "/rencana/plan", label: "Rincian acara" },
    { href: "/rencana/vendor", label: "Vendor" },
    { href: "/rencana/info", label: "Info keluarga" },
    { href: "/rencana/seragam", label: "Busana" },
  ];

  return (
    <nav className="tab tab-berjarak" aria-label="Modul Rencana">
      {tabList.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          data-aktif={pathname === t.href ? "ya" : undefined}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
