import { redirect } from "next/navigation";
import { sesiSekarang } from "@/lib/sesi";

/** Akar situs. Belum masuk ke layar masuk, sudah masuk ke Beranda. */
export default async function HalamanAkar() {
  const pengguna = await sesiSekarang();
  redirect(pengguna ? "/beranda" : "/masuk");
}
