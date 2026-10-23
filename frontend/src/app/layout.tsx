import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import { headers } from "next/headers";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { WhatsAppBubble } from "@/components/common/WhatsAppBubble";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { SITE, SITE_URL } from "@/lib/site";
import "./globals.css";

// latin-ext carries the Turkish letters (ş, ğ, ı, İ).
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mivvo — Yapay Zeka Destekli Ebeveyn Kontrol Uygulaması",
    template: "%s | Mivvo",
  },
  description:
    "Mivvo, çocuğunuzun mesajlarındaki siber zorbalık, tehdit, cinsel risk ve yabancı kişi temaslarını Türkçe yapay zeka ile tespit edip size anında bildiren ebeveyn kontrol uygulamasıdır. 14 gün ücretsiz.",
  applicationName: SITE.name,
  keywords: [
    "ebeveyn kontrol uygulaması",
    "çocuk güvenliği",
    "siber zorbalık",
    "çocuk telefon takip",
    "aile koruma uygulaması",
    "WhatsApp çocuk güvenliği",
    "Instagram çocuk güvenliği",
  ],
  authors: [{ name: SITE.company }],
  creator: SITE.company,
  publisher: SITE.company,
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large" } },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  other: { "google-play-app": "app-id=org.mivvo.parent" },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Public marketing pages carry their language in the URL (proxy sets x-mivvo-locale);
  // the app area keeps using the cookie.
  const headerLocale = (await headers()).get("x-mivvo-locale");
  const locale = headerLocale === "en" || headerLocale === "tr" ? headerLocale : await getLocaleFromServerCookie();

  return (
    <html lang={locale} className={`${inter.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LanguageSwitcher />
        <WhatsAppBubble />
        {children}
      </body>
    </html>
  );
}
