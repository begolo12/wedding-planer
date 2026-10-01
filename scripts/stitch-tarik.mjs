// Tarik screen dari Stitch MCP ke .stitch/ supaya bisa dibaca lokal.
// Kunci dibaca dari env, tidak pernah ditulis di berkas ini.
import { mkdir, writeFile } from "node:fs/promises";

const KEY = process.env.STITCH_API_KEY;
const PROYEK = "2056835612163595147";
const URL = "https://stitch.googleapis.com/mcp";

if (!KEY) {
  console.error("STITCH_API_KEY belum diisi.");
  process.exit(1);
}

async function rpc(method, params) {
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": KEY,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const teks = await res.text();
  const cocok = teks.match(/data:\s*(\{.*\})/s);
  const isi = cocok ? cocok[1] : teks;
  const json = JSON.parse(isi);
  if (json.error) throw new Error(JSON.stringify(json.error));
  return json.result;
}

async function panggil(nama, args) {
  const r = await rpc("tools/call", { name: nama, arguments: args });
  const teks = r.content?.[0]?.text ?? "{}";
  return JSON.parse(teks);
}

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

await mkdir(".stitch", { recursive: true });

const daftar = await panggil("list_screens", { projectId: PROYEK });
console.log(`${daftar.screens?.length ?? 0} screen`);

for (const s of daftar.screens ?? []) {
  const detail = await panggil("get_screen", { name: s.name });
  const nama = slug(s.title || s.name);
  if (detail.htmlCode?.downloadUrl) {
    const html = await fetch(detail.htmlCode.downloadUrl).then((r) => r.text());
    await writeFile(`.stitch/${nama}.html`, html);
  }
  if (detail.screenshot?.downloadUrl) {
    const buf = Buffer.from(
      await fetch(detail.screenshot.downloadUrl).then((r) => r.arrayBuffer()),
    );
    await writeFile(`.stitch/${nama}.png`, buf);
  }
  console.log(`ok: ${nama}`);
}

const proyek = await panggil("get_project", { name: `projects/${PROYEK}` });
await writeFile(
  ".stitch/desain.json",
  JSON.stringify(proyek.designTheme ?? {}, null, 2),
);
console.log("ok: desain.json");