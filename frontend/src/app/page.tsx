import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `Mivvo — Yapay Zeka Destekli Ebeveyn Kontrol Uygulaması | ${SITE.trialDays} Gün Ücretsiz` },
  description:
    `Çocuğunuzun WhatsApp, Instagram ve TikTok mesajlarındaki siber zorbalık, tehdit, cinsel risk ve yabancı kişi temaslarını Türkçe yapay zeka ile tespit edin. Anında bildirim, şeffaf koruma. ${SITE.trialDays} gün ücretsiz.`,
  alternates: { canonical: "/", languages: { tr: "/", en: "/en", "x-default": "/" } },
  openGraph: {
    title: "Mivvo — Çocuğunuz dijital dünyada yalnız değil",
    description: "Türkçe yapay zeka ile siber zorbalık, tehdit ve yabancı kişi risklerini anında tespit eden ebeveyn uygulaması.",
    url: "/",
    locale: "tr_TR",
  },
};

export default function HomePage() {
  return <LandingPage locale="tr" />;
}
