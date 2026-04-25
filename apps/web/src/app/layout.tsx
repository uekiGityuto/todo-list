import type { Metadata } from "next";
import { Toaster } from "sonner";
import { getCurrentTimerSession } from "@/shared/lib/api/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { AppQueryProvider } from "@/shared/providers/query-provider";
import { RecoveryDialogProvider } from "@/shared/ui/recovery-dialog-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "タスク管理",
  description: "副業タスク管理アプリ",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialTimerSession = user ? await getCurrentTimerSession() : null;

  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <AppQueryProvider>
          {children}
          {user && (
            <RecoveryDialogProvider initialSession={initialTimerSession} />
          )}
          <Toaster />
        </AppQueryProvider>
      </body>
    </html>
  );
}
