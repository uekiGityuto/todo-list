import { Inter } from "next/font/google";

import { RecoveryDialogProvider } from "@/components/recovery-dialog-provider";

import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "タスク管理",
  description: "副業タスク管理アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <RecoveryDialogProvider />
      </body>
    </html>
  );
}
