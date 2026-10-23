import Link from "next/link";
import QRCode from "qrcode";
import {
  ArrowRight,
  BellRing,
  Bot,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Flame,
  HeartCrack,
  Moon,
  BarChart3,
  ShieldAlert,
  Siren,
  Smartphone,
  Swords,
  UserX,
  MessageCircleWarning,
  Download,
  Play,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { SITE, absoluteUrl } from "@/lib/site";
import { landingContent } from "./content";
import { PhoneMockup } from "./PhoneMockup";
import { RiskDemo } from "./RiskDemo";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { JsonLd } from "./JsonLd";

const categoryIcons = {
  bullying: { icon: HeartCrack, color: "bg-rose-100 text-rose-600" },
  threat: { icon: ShieldAlert, color: "bg-red-100 text-red-600" },
  sexual: { icon: Siren, color: "bg-fuchsia-100 text-fuchsia-600" },
  stranger: { icon: UserX, color: "bg-orange-100 text-orange-600" },
  violence: { icon: Swords, color: "bg-amber-100 text-amber-700" },
  profanity: { icon: MessageCircleWarning, color: "bg-sky-100 text-sky-600" },
  anger: { icon: Flame, color: "bg-violet-100 text-violet-600" },
} as const;

const extraIcons = [BellRing, Bot, BarChart3, Moon];

const platforms = [
  { name: "WhatsApp", dot: "bg-[#25D366]" },
  { name: "Instagram", dot: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
  { name: "TikTok", dot: "bg-gray-900" },
  { name: "Snapchat", dot: "bg-[#FFFC00] ring-1 ring-black/10" },
  { name: "Telegram", dot: "bg-[#229ED9]" },
  { name: "SMS", dot: "bg-emerald-500" },
];

function SectionTitle({ eyebrow, title, sub, light }: { eyebrow?: string; title: string; sub?: string; light?: boolean }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
      {eyebrow && <p className={`mb-3 text-sm font-bold uppercase tracking-wider ${light ? "text-brand-100" : "text-brand-600"}`}>{eyebrow}</p>}
      <h2 className={`font-display text-3xl font-black tracking-tight sm:text-4xl ${light ? "text-white" : "text-gray-900"}`}>{title}</h2>
      {sub && <p className={`mt-4 text-lg leading-relaxed ${light ? "text-white/80" : "text-gray-600"}`}>{sub}</p>}
    </div>
  );
}

export async function LandingPage({ locale }: { locale: Locale }) {
  const c = landingContent[locale];
  const home = locale === "en" ? "/en" : "/";
  const qrSvg = await QRCode.toString(absoluteUrl("/indir"), {
    type: "svg",
    margin: 1,
    color: { dark: "#1E1B4B", light: "#FFFFFF" },
  });

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: locale === "en" ? "Mivvo Parental Control" : "Mivvo Ebeveyn Kontrol",
    operatingSystem: "Android, Web",
    applicationCategory: "LifestyleApplication",
    description: c.hero.desc,
    url: absoluteUrl(home),
    installUrl: SITE.parentPlayUrl,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: SITE.company, url: SITE.url },
    offers: [
      { "@type": "Offer", name: c.pricing.trial.name, price: "0", priceCurrency: "TRY" },
      {
        "@type": "Offer",
        name: c.pricing.monthly.name,
        price: String(SITE.monthlyPriceTl),
        priceCurrency: "TRY",
        priceSpecification: { "@type": "UnitPriceSpecification", price: SITE.monthlyPriceTl, priceCurrency: "TRY", billingDuration: "P1M" },
      },
    ],
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: SITE.company,
    url: SITE.url,
    logo: absoluteUrl("/icon-512.png"),
    email: SITE.email,
    address: { "@type": "PostalAddress", streetAddress: SITE.address.street, addressLocality: SITE.address.city, addressCountry: SITE.address.country },
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: SITE.email, availableLanguage: ["Turkish", "English"] },
    sameAs: [SITE.parentPlayUrl],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <JsonLd data={[orgLd, appLd, faqLd]} />
      <SiteHeader locale={locale} nav={c.nav} />

      <main id="main">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_10%_-10%,#ede9fe_0%,transparent_60%),radial-gradient(50rem_30rem_at_100%_0%,#ffe4dc_0%,transparent_55%)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-28 lg:pt-20">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-sm ring-1 ring-brand-100">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-coral-500" /></span>
                {c.hero.eyebrow}
              </p>
              <h1 className="mt-6 font-display text-4xl font-black leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                {c.hero.title1}{" "}
                <span className="bg-gradient-to-r from-brand-600 via-fuchsia-500 to-coral-500 bg-clip-text text-transparent">{c.hero.title2}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-600 lg:mx-0">{c.hero.desc}</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link href="/kayit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700">
                  {c.hero.primary} <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#demo" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-gray-800 ring-1 ring-gray-200 transition-colors hover:ring-brand-500">
                  <Play className="h-4 w-4 fill-current text-brand-600" /> {c.hero.secondary}
                </a>
              </div>
              <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-gray-600 lg:justify-start">
                {c.hero.trust.map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />{t}</li>
                ))}
              </ul>
            </div>
            <PhoneMockup p={c.hero.phone} />
          </div>
        </section>

        {/* PLATFORMS */}
        <section className="border-y border-gray-100 bg-gray-50/60 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-center text-sm font-semibold text-gray-500">{c.platformsTitle}</p>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {platforms.map((p) => (
                <li key={p.name} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-100">
                  <span className={`h-3 w-3 rounded-full ${p.dot}`} />{p.name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* WHY */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle title={c.why.title} sub={c.why.sub} />
            <div className="grid gap-6 md:grid-cols-3">
              {c.why.items.map((item, i) => (
                <div key={item.title} className="rounded-3xl bg-gradient-to-br from-gray-50 to-white p-7 ring-1 ring-gray-100">
                  <span className="font-display text-5xl font-black text-brand-100">0{i + 1}</span>
                  <h3 className="mt-3 text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="ozellikler" className="scroll-mt-20 bg-gray-950 py-20 text-white sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle title={c.features.title} sub={c.features.sub} light />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.features.categories.map((cat) => {
                const meta = categoryIcons[cat.key];
                return (
                  <div key={cat.key} className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 transition-colors hover:bg-white/[0.07]">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${meta.color}`}><meta.icon className="h-5 w-5" /></div>
                    <h3 className="mt-4 text-lg font-bold">{cat.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{cat.desc}</p>
                  </div>
                );
              })}
              <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-brand-600 to-fuchsia-600 p-6">
                <p className="font-display text-5xl font-black">7/24</p>
                <p className="mt-2 text-sm text-white/85">{locale === "en" ? "Protection running quietly in the background." : "Arka planda sessizce çalışan koruma."}</p>
              </div>
            </div>
            <div className="mt-14 grid gap-8 border-t border-white/10 pt-14 sm:grid-cols-2 lg:grid-cols-4">
              {c.features.extras.map((x, i) => {
                const Icon = extraIcons[i];
                return (
                  <div key={x.title}>
                    <Icon className="h-6 w-6 text-coral-400" />
                    <h3 className="mt-3 font-bold">{x.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{x.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DEMO */}
        <section id="demo" className="scroll-mt-20 bg-gradient-to-b from-brand-50 to-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle eyebrow={c.demo.eyebrow} title={c.demo.title} sub={c.demo.sub} />
            <RiskDemo samples={c.demo.samples} labels={c.demo} />
          </div>
        </section>

        {/* HOW */}
        <section id="nasil-calisir" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle title={c.how.title} />
            <ol className="grid gap-6 md:grid-cols-3">
              {c.how.steps.map((s, i) => (
                <li key={s.title} className="relative rounded-3xl p-7 ring-1 ring-gray-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 font-display text-xl font-black text-white shadow-lg shadow-brand-600/30">{i + 1}</span>
                  <h3 className="mt-5 text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* TRANSPARENCY */}
        <section className="pb-20 sm:pb-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-[2rem] bg-gradient-to-br from-emerald-50 via-white to-brand-50 p-8 ring-1 ring-gray-100 sm:p-12">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">{c.transparency.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-600">{c.transparency.sub}</p>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-emerald-100">
                  <p className="flex items-center gap-2 font-bold text-emerald-700"><Eye className="h-5 w-5" />{c.transparency.seesTitle}</p>
                  <ul className="mt-4 space-y-3">
                    {c.transparency.sees.map((s) => <li key={s} className="flex gap-2.5 text-gray-700"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-100">
                  <p className="flex items-center gap-2 font-bold text-gray-700"><EyeOff className="h-5 w-5" />{c.transparency.notTitle}</p>
                  <ul className="mt-4 space-y-3">
                    {c.transparency.not.map((s) => <li key={s} className="flex gap-2.5 text-gray-500"><span className="mt-2.5 h-0.5 w-3.5 shrink-0 rounded bg-gray-300" />{s}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="fiyat" className="scroll-mt-20 bg-gray-50 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionTitle title={c.pricing.title} sub={c.pricing.sub} />
            <div className="grid gap-6 md:grid-cols-2">
              {[c.pricing.trial, c.pricing.monthly].map((plan, i) => {
                const featured = i === 1;
                return (
                  <div key={plan.name} className={`relative flex flex-col rounded-3xl p-8 ${featured ? "bg-gray-950 text-white shadow-2xl shadow-brand-700/20" : "bg-white ring-1 ring-gray-200"}`}>
                    {"badge" in plan && <span className="absolute -top-3 right-8 rounded-full bg-coral-500 px-3 py-1 text-xs font-bold text-white">{plan.badge}</span>}
                    <h3 className={`text-lg font-bold ${featured ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                    <p className="mt-4 flex items-baseline gap-1.5">
                      <span className="font-display text-5xl font-black">{plan.price}</span>
                      <span className={featured ? "text-gray-400" : "text-gray-500"}>{plan.period}</span>
                    </p>
                    <ul className="mb-8 mt-7 flex-1 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className={`flex gap-2.5 text-sm ${featured ? "text-gray-300" : "text-gray-600"}`}>
                          <Check className={`h-5 w-5 shrink-0 ${featured ? "text-coral-400" : "text-brand-600"}`} />{f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/kayit" className={`rounded-2xl px-6 py-3.5 text-center font-bold transition-colors ${featured ? "bg-white text-gray-950 hover:bg-brand-50" : "bg-brand-600 text-white hover:bg-brand-700"}`}>
                      {plan.cta}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DOWNLOAD */}
        <section id="indir" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle title={c.download.title} />
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr_auto]">
              <div className="flex flex-col rounded-3xl bg-gradient-to-br from-brand-600 to-fuchsia-600 p-8 text-white">
                <Smartphone className="h-8 w-8 text-white/80" />
                <h3 className="mt-4 font-display text-2xl font-black">{c.download.parentTitle}</h3>
                <p className="mt-2 flex-1 text-white/85">{c.download.parentDesc}</p>
                <a href={SITE.parentPlayUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-fit items-center gap-3 rounded-xl bg-black px-5 py-3 transition-transform hover:-translate-y-0.5">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path fill="#34A853" d="M3.6 1.8 13.8 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1Z" /><path fill="#FBBC04" d="m17.2 15.4-3.4-3.4 3.4-3.4 4 2.3c1.1.6 1.1 1.6 0 2.2l-4 2.3Z" /><path fill="#EA4335" d="M17.2 15.4 13.8 12 3.6 22.2c.4.2.9.2 1.4-.1l12.2-6.7Z" /><path fill="#4285F4" d="M17.2 8.6 5 1.9c-.5-.3-1-.3-1.4-.1L13.8 12l3.4-3.4Z" /></svg>
                  <span className="text-left leading-tight"><span className="block text-[10px] font-medium text-white/70">{c.download.getItOn}</span><span className="text-lg font-bold">Google Play</span></span>
                </a>
              </div>
              <div className="flex flex-col rounded-3xl bg-gradient-to-br from-coral-400 to-rose-500 p-8 text-white">
                <Smartphone className="h-8 w-8 text-white/80" />
                <h3 className="mt-4 font-display text-2xl font-black">{c.download.childTitle}</h3>
                <p className="mt-2 flex-1 text-white/90">{c.download.childDesc}</p>
                <Link href="/indir/cocuk" className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-rose-600 transition-transform hover:-translate-y-0.5">
                  <Download className="h-5 w-5" /> {c.download.childCta}
                </Link>
                <p className="mt-3 text-xs text-white/80">{c.download.childNote}</p>
              </div>
              <div className="hidden flex-col items-center justify-center rounded-3xl p-6 ring-1 ring-gray-200 lg:flex">
                <div className="h-40 w-40 overflow-hidden rounded-2xl [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} role="img" aria-label="QR: mivvo.org/indir" />
                <p className="mt-3 max-w-40 text-center text-xs font-medium text-gray-500">{c.download.qr}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="sss" className="scroll-mt-20 bg-gray-50 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionTitle title={c.faq.title} />
            <div className="space-y-3">
              {c.faq.items.map((item) => (
                <details key={item.q} className="group rounded-2xl bg-white p-5 ring-1 ring-gray-200 open:ring-brand-500/40 sm:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-gray-900">
                    <h3>{item.q}</h3>
                    <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-500 to-fuchsia-600 px-6 py-16 text-center text-white sm:px-12">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-coral-400/30" />
            <h2 className="relative font-display text-3xl font-black tracking-tight sm:text-5xl">{c.cta.title}</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/85">{c.cta.desc}</p>
            <Link href="/kayit" className="relative mt-9 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-xl transition-transform hover:-translate-y-0.5">
              {c.cta.button} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
