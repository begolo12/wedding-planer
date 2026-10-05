import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("kontrak visual", () => {
  it("mempertahankan token geometri dan breakpoint desain", () => {
    expect(css).toContain("--radius-kontrol: 16px");
    expect(css).toContain("--radius-kartu: 24px");
    expect(css).toContain("--radius-lembar: 32px");
    expect(css).toContain("@media (min-width: 1023px)");
    expect(css).toContain("@media (max-width: 639px)");
  });

  it("menyediakan lapisan visual auth dan beranda", () => {
    expect(css).toContain(".auth-kartu[data-visual-screen=\"auth-card\"]");
    expect(css).toContain(".beranda-hero {");
    expect(css).toContain(".beranda-metrik {");
  });
});
