import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DataSyncProvider } from "@/components/providers/DataSyncProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireTalant — Резюме мертво. Контекст — король.",
  description: "Платформа найма нового поколения. Кандидаты рассказывают истории, ИИ строит семантический профиль.",
  keywords: ["найм", "рекрутинг", "ИИ", "семантический поиск", "таланты", "портфолио"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <DataSyncProvider>
          {children}
          <AuthGuard />
        </DataSyncProvider>
      </body>
    </html>
  );
}
