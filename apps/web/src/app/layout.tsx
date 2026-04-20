import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getCurrentTimerSession } from "@/shared/lib/api/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { AppQueryProvider } from "@/shared/providers/query-provider";
import { RecoveryDialogProvider } from "@/shared/ui/recovery-dialog-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppQueryProvider>
          {children}
          {user && (
            <RecoveryDialogProvider initialSession={initialTimerSession} />
          )}
        </AppQueryProvider>
      </body>
    </html>
  );
}
