"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">エラーが発生しました</h1>
      <p className="text-muted-foreground">
        ページの表示中に問題が発生しました。
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          もう一度試す
        </button>
        <Link
          href="/login"
          className="rounded-md border border-input px-4 py-2 hover:bg-accent"
        >
          ログインページへ
        </Link>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          エラーID: {error.digest}
        </p>
      )}
    </div>
  );
}
