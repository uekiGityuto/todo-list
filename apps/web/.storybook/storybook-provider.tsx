"use client";

import { Toaster } from "sonner";
import { AppQueryProvider } from "@/shared/providers/query-provider";

export function StorybookProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppQueryProvider>
      {children}
      <Toaster />
    </AppQueryProvider>
  );
}
