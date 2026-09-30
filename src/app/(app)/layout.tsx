import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { NavBawah, NavSisi } from "@/components/nav";
import { ToastHost } from "@/components/toast";
import { LuringBanner } from "@/components/luring-banner";
import { DaftarServiceWorker, InstallPrompt } from "@/components/pwa";
import { sesiSekarang } from "@/lib/sesi";
import { namaPlan, namaPlaceholder } from "@/lib/plan";
import { planPertamaPengguna } from "@/lib/server-plan";

/**
 * Kerangka semua layar yang butuh masuk. Pemeriksaan sesi ada di sini, bukan
 * di tiap halaman, jadi satu halaman baru tidak bisa lupa memeriksanya.
 */
export default async function LayoutApp({ children }: { children: ReactNode }) {
  const pengguna = await sesiSekarang();
  if (!pengguna) redirect("/masuk");

  const plan = await planPertamaPengguna(pengguna.id);
  const nama = plan ? namaPlan(pengguna.name, plan.partnerName) : namaPlaceholder();

  return (
    <div className="tata-app">
      <DaftarServiceWorker />
      <NavSisi namaPasangan={nama} />
      <a className="lompat" href="#konten">
        Lompat ke isi
      </a>
      <div className="isi-app">
        <LuringBanner />
        <InstallPrompt />
        <main className="bungkus" id="konten">
          {children}
        </main>
      </div>
      <NavBawah />
      <ToastHost />
    </div>
  );
}
