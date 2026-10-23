import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { landingContent } from "@/components/landing/content";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Ebeveyn Rehberi: Çocuklar İçin Dijital Güvenlik",
  description:
    "Siber zorbalık, çevrim içi istismar, ilk akıllı telefon ve dijital güvenlik konuşmaları hakkında uzman içerikli ebeveyn rehberleri.",
  alternates: { canonical: "/rehber" },
  openGraph: { url: "/rehber", type: "website" },
};

export default function GuideIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader locale="tr" nav={landingContent.tr.nav} />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-brand-50 to-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Ebeveyn Rehberi</p>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">Dijital dünyada çocuğunuzun yanında olun</h1>
            <p className="mt-4 text-lg text-gray-600">Siber zorbalıktan ilk akıllı telefona; ebeveynler için sade, uygulanabilir rehberler.</p>
          </div>
        </section>
        <section className="pb-24">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2">
            {guides.map((g) => (
              <Link key={g.slug} href={`/rehber/${g.slug}`} className="group flex flex-col rounded-3xl p-7 ring-1 ring-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-600/10 hover:ring-brand-500/40">
                <span className="w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{g.category}</span>
                <h2 className="mt-4 text-xl font-bold leading-snug text-gray-900 group-hover:text-brand-700">{g.title}</h2>
                <p className="mt-3 flex-1 text-gray-600">{g.description}</p>
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500"><Clock className="h-4 w-4" />{g.readMinutes} dk okuma</span>
                  <span className="flex items-center gap-1 font-bold text-brand-600">Oku <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale="tr" />
    </div>
  );
}
