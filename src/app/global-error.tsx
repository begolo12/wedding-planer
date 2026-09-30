"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          padding: "48px 16px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#fbf9f6",
          color: "#2b2622",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem" }}>Aplikasi mengalami kendala</h1>
          <p style={{ color: "#666", margin: "12px 0 24px" }}>
            Terjadi masalah saat memuat aplikasi. Muat ulang halaman untuk melanjutkan.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              background: "#b5643c",
              color: "#ffffff",
              border: 0,
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}
