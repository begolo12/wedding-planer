"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlan } from "@/lib/use-plan";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import {
  KATEGORI_TAMU,
  type KategoriTamu,
  LABEL_KATEGORI_TAMU,
} from "@/lib/konstanta";
import type { BarisTamu } from "@/lib/impor-tamu";

/**
 * Layar Impor / Tempel Daftar Tamu.
 * Membaca salinan teks dari WhatsApp atau Excel, menampilkannya dalam pratinjau,
 * lalu menyimpannya ke daftar tamu tanpa membuat baris kembar.
 */
export default function HalamanImporTamu() {
  const router = useRouter();
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const [langkah, setLangkah] = useState<1 | 2>(1);
  const [teks, setTeks] = useState("");
  const [kategori, setKategori] = useState<KategoriTamu>("teman");

  const [sedangPeriksa, setSedangPeriksa] = useState(false);
  const [galatPeriksa, setGalatPeriksa] = useState<string | null>(null);

  const [preview, setPreview] = useState<BarisTamu[]>([]);
  const [dipilih, setDipilih] = useState<Set<string>>(new Set());

  const [sedangSimpan, setSedangSimpan] = useState(false);

  async function periksaDaftar(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!teks.trim()) {
      setGalatPeriksa("Tempel dulu daftar nama tamu yang ingin dimasukkan.");
      return;
    }

    setSedangPeriksa(true);
    setGalatPeriksa(null);

    try {
      const res = await minta<{ preview: BarisTamu[] }>(
        `/api/plans/${planId}/guests/import`,
        {
          method: "POST",
          body: {
            teks: teks.trim(),
            category: kategori,
            previewOnly: true,
          },
        },
      );

      if (!res.preview || res.preview.length === 0) {
        setGalatPeriksa("Tidak ada nama tamu yang terbaca dari teks yang ditempel.");
        return;
      }

      setPreview(res.preview);
      // Default pilih semua yang tidak kembar
      const aman = new Set<string>();
      for (const item of res.preview) {
        if (!item.kembar) {
          aman.add(item.name);
        }
      }
      setDipilih(aman);
      setLangkah(2);
    } catch (err) {
      setGalatPeriksa(pesanGalat(err));
    } finally {
      setSedangPeriksa(false);
    }
  }

  function togglePilih(nama: string) {
    setDipilih((prev) => {
      const baru = new Set(prev);
      if (baru.has(nama)) {
        baru.delete(nama);
      } else {
        baru.add(nama);
      }
      return baru;
    });
  }

  function toggleSemua() {
    const semuaAman = preview.filter((p) => !p.kembar).map((p) => p.name);
    if (dipilih.size === semuaAman.length) {
      setDipilih(new Set());
    } else {
      setDipilih(new Set(semuaAman));
    }
  }

  async function simpanHasil() {
    if (!planId) return;
    if (dipilih.size === 0) {
      toast("Pilih minimal satu nama tamu untuk disimpan.");
      return;
    }

    setSedangSimpan(true);
    try {
      const res = await minta<{ created: number }>(
        `/api/plans/${planId}/guests/import`,
        {
          method: "POST",
          body: {
            teks: teks.trim(),
            category: kategori,
            previewOnly: false,
            pilih: Array.from(dipilih),
          },
        },
      );

      toast(`${res.created} tamu berhasil ditambahkan`);
      router.push("/tamu");
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangSimpan(false);
    }
  }

  if (memuatPlan) {
    return <Kerangka baris={6} />;
  }

  if (galatPlan) {
    return <Gagal apa="Rencana pernikahan" onCoba={muatPlan} />;
  }

  if (!plan) {
    return (
      <Kosong
        keadaan="Belum ada rencana pernikahan."
        jalanKeluar="Mulai buat rencana pertama kamu sekarang."
      >
        <Link className="tombol tombol-utama" href="/rencana/plan">
          Buat rencana
        </Link>
      </Kosong>
    );
  }

  return (
    <div className="tumpuk-sedang">
      <Link className="tautan-kalimat" href="/tamu">
        ← Kembali ke daftar tamu
      </Link>

      <div className="kepala-halaman">
        <div>
          <h1>Tempel daftar tamu</h1>
          <p>
            {langkah === 1
              ? "Langkah 1 dari 2: Tempel teks nama tamu dari WhatsApp, catatan HP, atau Excel."
              : "Langkah 2 dari 2: Periksa nama yang terdeteksi sebelum disimpan ke daftar tamu."}
          </p>
        </div>
      </div>

      {langkah === 1 ? (
        <form onSubmit={periksaDaftar} noValidate className="kartu tumpuk-sedang">
          <Pilih
            label="Kategori untuk tamu yang diimpor"
            id="kategoriImpor"
            nilai={kategori}
            onUbah={(v) => setKategori(v as KategoriTamu)}
            opsi={KATEGORI_TAMU.map((k) => ({
              nilai: k,
              label: LABEL_KATEGORI_TAMU[k],
            }))}
          />

          <Isian
            label="Daftar nama tamu (satu nama per baris)"
            id="teksImpor"
            galat={galatPeriksa ?? undefined}
            bantuan="Bisa format: 'Nama, Jumlah' seperti 'Bpk. Budi, 2' atau cukup 'Nama' saja (otomatis dihitung 1 orang)."
          >
            <textarea
              id="teksImpor"
              className="isian"
              rows={12}
              required
              placeholder={`Contoh teks:\nBpk. Danu & Ibu, 2\nAhmad Fauzi, 1\nIbu Ratna, 3\nKeluarga Om Hadi, 4`}
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
            />
          </Isian>

          <p className="keterangan">
            {teks.split("\n").filter((b) => b.trim()).length} baris terbaca
          </p>

          <div className="dialog-tombol">
            <Link className="tombol tombol-sekunder" href="/tamu">
              Batal
            </Link>
            <button
              type="submit"
              className="tombol tombol-utama"
              disabled={sedangPeriksa}
            >
              {sedangPeriksa ? "Membaca data..." : "Periksa daftar (Lanjut) →"}
            </button>
          </div>
        </form>
      ) : (
        <div className="tumpuk-sedang">
          <div className="rekap">
            <div className="rekap-item">
              <span className="rekap-nilai">{preview.length}</span>
              <span className="rekap-label">Baris terbaca</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai teks-aksen">
                {dipilih.size}
              </span>
              <span className="rekap-label">Dipilih untuk disimpan</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai teks-bahaya">
                {preview.filter((p) => p.kembar).length}
              </span>
              <span className="rekap-label">Nama kembar (dilewati)</span>
            </div>
          </div>

          <label className="pilih-kartu">
            <input
              type="checkbox"
              checked={
                dipilih.size === preview.filter((p) => !p.kembar).length &&
                dipilih.size > 0
              }
              onChange={toggleSemua}
            />
            <span className="pilih-kartu-isi">
              <span className="pilih-kartu-judul">
                Pilih semua yang aman ({preview.filter((p) => !p.kembar).length} nama)
              </span>
              <span className="pilih-kartu-ket">
                Kategori: {LABEL_KATEGORI_TAMU[kategori]}
              </span>
            </span>
          </label>

          <div className="tumpuk-rapat">
            {preview.map((item, idx) => (
              <label
                key={idx}
                className="pilih-kartu"
                data-aktif={dipilih.has(item.name) ? "ya" : undefined}
                data-kembar={item.kembar ? "ya" : undefined}
              >
                <input
                  type="checkbox"
                  disabled={item.kembar}
                  checked={dipilih.has(item.name)}
                  onChange={() => togglePilih(item.name)}
                />
                <span className="pilih-kartu-isi">
                  <span className="pilih-kartu-judul">{item.name}</span>
                  {item.catatan ? (
                    <span className="pilih-kartu-ket teks-bahaya">
                      {item.catatan}
                    </span>
                  ) : null}
                </span>
                <span className="aksi-baris">
                  <span className="lencana">{item.guestCount} orang</span>
                  {item.kembar ? <span className="lencana lencana-terlambat">Sudah ada</span> : null}
                </span>
              </label>
            ))}
          </div>

          <div className="aksi-baris" data-ratakan="antara">
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setLangkah(1)}
            >
              ← Ubah teks masukan
            </button>
            <button
              type="button"
              className="tombol tombol-utama"
              disabled={sedangSimpan || dipilih.size === 0}
              onClick={simpanHasil}
            >
              {sedangSimpan
                ? "Menyimpan ke daftar tamu..."
                : `Simpan ${dipilih.size} tamu ke daftar`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
