import Link from "next/link";
import {
  ShieldCheck,
  BellRing,
  Brain,
  Lock,
  ChevronRight,
  MessageCircleWarning,
  BarChart3,
} from "lucide-react";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { MivvoLogo } from "@/components/common/MivvoLogo";

const content = {
  tr: {
    navFeatures: "Özellikler",
    navHow: "Nasıl Çalışır?",
    navKvkk: "KVKK",
    signIn: "Giriş Yap",
    freeStart: "Ücretsiz Başla",
    badge: "18 yaş altı için ebeveyn koruma sistemi",
    heroTitle1: "Çocuğunuzu Dijital",
    heroTitle2: "Tehlikelerden Koruyun",
    heroDesc:
      "Mivvo, yapay zeka ile çocuğunuzun mesajlarını analiz ederek zorbalık, tehdit, küfür ve riskli içerikleri anında tespit eder.",
    tryFree: "Ücretsiz Deneyin",
    pricingTitle: "Fiyatlandırma",
    pricingSub: "İlk 7 analiz ücretsiz. Sonrasında aylık abonelik 299 TL'dir.",
    trialCardTitle: "Deneme Paketi",
    trialCardPrice: "İlk 7 analiz ücretsiz",
    trialCardDesc: "Kurulum ve temel testler için ideal.",
    paidCardTitle: "Aylık Abonelik",
    paidCardPrice: "299 TL / ay",
    paidCardDesc: "Sürekli koruma, raporlar ve anlık bildirimler.",
    whyTitle: "Neden Mivvo?",
    howTitle: "Nasıl Çalışır?",
    kvkkTitle: "KVKK'ya Tam Uyumlu",
    ctaTitle: "Çocuğunuzu Bugün Korumaya Başlayın",
    ctaDesc: "Ücretsiz hesap oluşturun, kurulumunuzu dakikalar içinde tamamlayın.",
    legalPrivacy: "Gizlilik Politikası",
    legalKvkk: "KVKK Aydınlatma",
    legalContact: "İletişim",
    allRights: "Tüm hakları saklıdır.",
  },
  en: {
    navFeatures: "Features",
    navHow: "How It Works",
    navKvkk: "KVKK",
    signIn: "Sign In",
    freeStart: "Start Free",
    badge: "Parental safety system for under 18",
    heroTitle1: "Protect Your Child",
    heroTitle2: "From Digital Threats",
    heroDesc:
      "Mivvo analyzes messages with AI to detect bullying, threats, profanity, and risky content in real time.",
    tryFree: "Try for Free",
    pricingTitle: "Pricing",
    pricingSub: "First 7 analyses are free. Then monthly subscription is 299 TRY.",
    trialCardTitle: "Trial Plan",
    trialCardPrice: "First 7 analyses free",
    trialCardDesc: "Great for setup and initial testing.",
    paidCardTitle: "Monthly Subscription",
    paidCardPrice: "299 TRY / month",
    paidCardDesc: "Continuous protection, reports, and instant alerts.",
    whyTitle: "Why Mivvo?",
    howTitle: "How It Works",
    kvkkTitle: "Fully KVKK Compliant",
    ctaTitle: "Start Protecting Your Child Today",
    ctaDesc: "Create your free account and finish setup in minutes.",
    legalPrivacy: "Privacy Policy",
    legalKvkk: "KVKK Disclosure",
    legalContact: "Contact",
    allRights: "All rights reserved.",
  },
} as const;

export default async function HomePage() {
  const locale = await getLocaleFromServerCookie();
  const c = content[locale];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mivvo.org";
  const childAppUrl = `${siteUrl}/indir/cocuk`;
  const parentAppUrl = `${siteUrl}/indir/ebeveyn`;

  const childQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(childAppUrl)}`;
  const parentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(parentAppUrl)}`;

  const features = [
    {
      icon: Brain,
      title: locale === "en" ? "AI Analysis" : "Yapay Zeka Analizi",
      desc:
        locale === "en"
          ? "GPT-based Turkish content analysis for bullying, threats, and risky language."
          : "GPT destekli Türkçe içerik analizi. Küfür, zorbalık, tehdit ve riskli ifadeleri tespit eder.",
      color: "bg-violet-100 text-violet-600",
    },
    {
      icon: BellRing,
      title: locale === "en" ? "Instant Alerts" : "Anında Bildirim",
      desc:
        locale === "en"
          ? "Parents receive push and email notifications when risky content is detected."
          : "Riskli içerik tespit edildiğinde ebeveyni push bildirim ve e-posta ile anında uyarır.",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: ShieldCheck,
      title: locale === "en" ? "KVKK Compliant" : "KVKK Uyumlu",
      desc:
        locale === "en"
          ? "Only risk-related text fragments are stored for data minimization."
          : "Yalnızca riskli kısımlar işlenir, tüm konuşmalar saklanmaz.",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: Lock,
      title: locale === "en" ? "Transparent Protection" : "Şeffaf Koruma",
      desc:
        locale === "en"
          ? "Not hidden surveillance, but safe and transparent parental guidance."
          : "Gizli gözetim değil, güvenli ebeveynlik.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: MessageCircleWarning,
      title: locale === "en" ? "6 Risk Categories" : "6 Risk Kategorisi",
      desc:
        locale === "en"
          ? "Bullying, violence, sexual risk, threat, profanity, and extreme anger."
          : "Zorbalık, şiddet, cinsel risk, tehdit, küfür ve aşırı öfke kategorileri takip edilir.",
      color: "bg-rose-100 text-rose-600",
    },
    {
      icon: BarChart3,
      title: locale === "en" ? "Detailed Reports" : "Detaylı Raporlar",
      desc:
        locale === "en"
          ? "Weekly and monthly trends for complete digital safety visibility."
          : "Haftalık ve aylık trend raporları ile dijital ortamı bütünsel görebilirsiniz.",
      color: "bg-amber-100 text-amber-600",
    },
  ];

  const stats = [
    { value: "18+", label: locale === "en" ? "Family Safety Focus" : "Aile Güvenliği Odağı" },
    { value: "%94", label: locale === "en" ? "Detection Accuracy" : "Tespit Doğruluğu" },
    { value: "<2s", label: locale === "en" ? "Avg. Analysis Time" : "Ortalama Analiz Süresi" },
    { value: "KVKK", label: locale === "en" ? "Compliant" : "Uyumlu" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white font-[family-name:var(--font-inter)]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MivvoLogo size={30} textClassName="text-xl" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#ozellikler" className="hover:text-violet-600 transition-colors">{c.navFeatures}</a>
            <a href="#nasil-calisir" className="hover:text-violet-600 transition-colors">{c.navHow}</a>
            <a href="#kvkk" className="hover:text-violet-600 transition-colors">{c.navKvkk}</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/giris"
              className="text-sm text-gray-700 hover:text-violet-600 font-medium transition-colors"
            >
              {c.signIn}
            </Link>
            <Link
              href="/kayit"
              className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {c.freeStart}
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-20 pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            {c.badge}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            {c.heroTitle1}
            <br />
            <span className="text-violet-600">{c.heroTitle2}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {c.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kayit"
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-violet-200"
            >
              {c.tryFree} <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#nasil-calisir"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-violet-300 text-gray-700 text-base font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              {c.navHow}
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-violet-600 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-2 text-center text-3xl font-extrabold text-gray-900">{c.pricingTitle}</h2>
          <p className="mb-8 text-center text-gray-500">{c.pricingSub}</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">{c.trialCardTitle}</h3>
              <p className="mt-2 text-violet-700 font-semibold">{c.trialCardPrice}</p>
              <p className="mt-3 text-sm text-gray-500">{c.trialCardDesc}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">{c.paidCardTitle}</h3>
              <p className="mt-2 text-violet-700 font-semibold">{c.paidCardPrice}</p>
              <p className="mt-3 text-sm text-gray-500">{c.paidCardDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="ozellikler" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              {c.whyTitle}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="py-24 bg-violet-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              {c.howTitle}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: locale === "en" ? "Install the App" : "Uygulamayı Yükleyin",
                desc: locale === "en" ? "Install Mivvo on parent and child devices with explicit consent." : "Ebeveyn ve çocuk telefonlarına Mivvo'yu yükleyin. Her iki tarafın onayı alınır.",
              },
              {
                step: "2",
                title: locale === "en" ? "AI Analyzes" : "Yapay Zeka Analiz Eder",
                desc: locale === "en" ? "Messages are analyzed in the background and only risky fragments are processed." : "Mesajlar arka planda analiz edilir. Sadece riskli içerik işlenir.",
              },
              {
                step: "3",
                title: locale === "en" ? "Get Instant Alerts" : "Anında Haberdar Olun",
                desc: locale === "en" ? "When risk is detected, you receive instant notifications and dashboard details." : "Risk tespit edildiğinde anlık bildirim gelir. Dashboard'dan detayları görebilirsiniz.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="w-12 h-12 bg-violet-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="indir" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              {locale === "en" ? "Install Apps by Scanning QR" : "QR Okutarak Uygulamayı İndirin"}
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              {locale === "en"
                ? "Scan the QR with your phone camera and install instantly. Separate links are provided for child and parent apps."
                : "Telefon kamerası ile QR kodu okutun, uygulama indirme sayfasına anında gidin. Çocuk ve ebeveyn uygulamaları için ayrı QR kodlar hazır."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {locale === "en" ? "Child App" : "Çocuk Uygulaması"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {locale === "en" ? "Install on the child's device" : "Çocuğun telefonuna yükleyin"}
              </p>
              <img
                src={childQrUrl}
                alt={locale === "en" ? "Child app QR code" : "Çocuk uygulaması QR kodu"}
                className="mx-auto w-52 h-52 rounded-xl border border-gray-200 bg-white"
              />
              <a
                href={childAppUrl}
                className="mt-5 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                {locale === "en" ? "Open Download Link" : "İndirme Linkini Aç"}
              </a>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {locale === "en" ? "Parent App" : "Ebeveyn Uygulaması"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {locale === "en" ? "Install on the parent's device" : "Ebeveyn telefonuna yükleyin"}
              </p>
              <img
                src={parentQrUrl}
                alt={locale === "en" ? "Parent app QR code" : "Ebeveyn uygulaması QR kodu"}
                className="mx-auto w-52 h-52 rounded-xl border border-gray-200 bg-white"
              />
              <a
                href={parentAppUrl}
                className="mt-5 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                {locale === "en" ? "Open Download Link" : "İndirme Linkini Aç"}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="kvkk" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            {c.kvkkTitle}
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            {locale === "en"
              ? "Under Turkish Data Protection Law No. 6698, explicit consent is obtained and only minimum required data is processed."
              : "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında açık rıza alınır, veri minimizasyonu sağlanır."}
          </p>
        </div>
      </section>

      <section className="bg-violet-600 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {c.ctaTitle}
          </h2>
          <p className="text-violet-200 mb-8">
            {c.ctaDesc}
          </p>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 bg-white text-violet-600 hover:bg-violet-50 font-bold text-base px-8 py-4 rounded-xl transition-colors shadow-lg"
          >
            {c.freeStart} <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MivvoLogo size={22} textClassName="text-white" />
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/gizlilik" className="hover:text-white transition-colors">{c.legalPrivacy}</Link>
              <Link href="/kvkk" className="hover:text-white transition-colors">{c.legalKvkk}</Link>
              <Link href="/iletisim" className="hover:text-white transition-colors">{c.legalContact}</Link>
            </div>
            <p className="text-xs">© {new Date().getFullYear()} Mivvo. {c.allRights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


