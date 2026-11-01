import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `Mivvo — AI-Powered Parental Control App | ${SITE.trialDays}-Day Free Trial` },
  description:
    `Detect cyberbullying, threats, sexual risk and stranger contact in your child's WhatsApp, Instagram and TikTok messages with AI. Instant alerts, transparent protection. ${SITE.trialDays} days free.`,
  alternates: { canonical: "/en", languages: { tr: "/", en: "/en", "x-default": "/" } },
  openGraph: {
    title: "Mivvo — Your child is never alone in the digital world",
    description: "AI parental app that detects cyberbullying, threats and stranger risks in real time.",
    url: "/en",
    locale: "en_US",
  },
};

export default function HomePageEn() {
  return <LandingPage locale="en" />;
}
