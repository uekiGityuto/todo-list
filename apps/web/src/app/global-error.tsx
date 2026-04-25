/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            fontFamily: "sans-serif",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
            エラーが発生しました
          </h1>
          <p style={{ color: "#6b7280" }}>
            ページの表示中に問題が発生しました。
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                backgroundColor: "#0f172a",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              もう一度試す
            </button>
            <a
              href="/login"
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              ログインページへ
            </a>
          </div>
          {error.digest && (
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>
              エラーID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
