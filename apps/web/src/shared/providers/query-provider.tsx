"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "../lib/api/errors";

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    const message = error.errorMessage;
    toast.error(message, { id: message });
  } else {
    toast.error("エラーが発生しました", { id: "unknown-error" });
  }
}

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 30_000,
          },
        },
        queryCache: new QueryCache({
          onError: handleError,
        }),
        mutationCache: new MutationCache({
          onError: handleError,
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
