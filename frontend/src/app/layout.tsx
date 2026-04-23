import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { WhatsAppBubble } from "@/components/common/WhatsAppBubble";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
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
  const localePromise = getLocaleFromServerCookie();

  return (
    <RootLayoutInner localePromise={localePromise}>{children}</RootLayoutInner>
  );
}

async function RootLayoutInner({
  children,
  localePromise,
}: {
  children: React.ReactNode;
  localePromise: Promise<"tr" | "en">;
}) {
  const locale = await localePromise;

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="fixed right-4 top-4 z-50">
          <LanguageSwitcher />
        </div>
        <WhatsAppBubble />
        {children}
      </body>
    </html>
  );
}
