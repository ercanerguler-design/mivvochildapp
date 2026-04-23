import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mivvo — Çocuğunuzu Dijital Dünyada Koruyun",
  description:
    "Mivvo, yapay zeka destekli ebeveyn koruma uygulamasıdır. Çocuğunuzun mesajlarındaki zorbalık, tehdit ve riskli içerikleri anında tespit eder.",
  keywords: ["ebeveyn kontrolü", "dijital güvenlik", "çocuk koruma", "zorbalık önleme"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
