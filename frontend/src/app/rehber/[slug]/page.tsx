import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Clock, Lightbulb } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { JsonLd } from "@/components/landing/JsonLd";
import { landingContent } from "@/components/landing/content";
import { MivvoMark } from "@/components/common/MivvoLogo";
import { getGuide, guides, type GuideBlock } from "@/lib/guides";
import { SITE, absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/rehber/${guide.slug}` },
    openGraph: {
      type: "article",
      url: `/rehber/${guide.slug}`,
      title: guide.title,
      description: guide.description,
      publishedTime: guide.published,
      modifiedTime: guide.updated,
    },
  };
}

function Block({ b }: { b: GuideBlock }) {
  switch (b.type) {
    case "h2":
      return <h2 className="mt-12 font-display text-2xl font-black tracking-tight text-gray-900">{b.text}</h2>;
    case "p":
      return <p className="mt-5 text-lg leading-8 text-gray-700">{b.text}</p>;
    case "ul":
      return (
        <ul className="mt-5 space-y-3 text-lg leading-8 text-gray-700">
          {b.items.map((i) => <li key={i} className="flex gap-3"><span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-brand-500" />{i}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-5 space-y-3 text-lg leading-8 text-gray-700">
          {b.items.map((i, n) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{n + 1}</span>
              {i}
            </li>
          ))}
        </ol>
      );
    case "tip":
      return (
        <div className="mt-8 flex gap-3 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-base leading-7 text-amber-950">{b.text}</p>
        </div>
      );
  }
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const others = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const date = new Date(guide.updated).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      datePublished: guide.published,
      dateModified: guide.updated,
      inLanguage: "tr",
      mainEntityOfPage: absoluteUrl(`/rehber/${guide.slug}`),
      image: absoluteUrl("/opengraph-image.png"),
      author: { "@type": "Organization", name: "Mivvo Editör Ekibi", url: SITE.url },
      publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") } },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Mivvo", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Ebeveyn Rehberi", item: absoluteUrl("/rehber") },
        { "@type": "ListItem", position: 3, name: guide.title, item: absoluteUrl(`/rehber/${guide.slug}`) },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <JsonLd data={ld} />
      <SiteHeader locale="tr" nav={landingContent.tr.nav} />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-600">Ana sayfa</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/rehber" className="hover:text-brand-600">Ebeveyn Rehberi</Link>
          </nav>
          <span className="mt-6 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{guide.category}</span>
          <h1 className="mt-4 font-display text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-[2.6rem]">{guide.title}</h1>
          <p className="mt-5 flex items-center gap-3 text-sm text-gray-500">
            <span>Güncellendi: <time dateTime={guide.updated}>{date}</time></span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{guide.readMinutes} dk</span>
          </p>
          <div className="mt-4">
            {guide.body.map((b, i) => <Block key={i} b={b} />)}
          </div>

          <aside className="mt-14 flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-brand-600 to-fuchsia-600 p-7 text-white sm:flex-row sm:items-center">
            <MivvoMark size={56} />
            <div className="flex-1">
              <p className="font-display text-xl font-black">Riskleri ilk gün öğrenin</p>
              <p className="mt-1 text-white/85">Mivvo, zorbalık ve taciz içeren mesajları tespit edip size anında haber verir. {SITE.trialDays} gün ücretsiz.</p>
            </div>
            <Link href="/kayit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-brand-700">
              Ücretsiz Dene <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </article>

        <section className="border-t border-gray-100 bg-gray-50 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-black text-gray-900">Diğer rehberler</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {others.map((g) => (
                <Link key={g.slug} href={`/rehber/${g.slug}`} className="rounded-2xl bg-white p-6 ring-1 ring-gray-200 transition-shadow hover:shadow-lg">
                  <span className="text-xs font-bold text-brand-600">{g.category}</span>
                  <p className="mt-2 font-bold leading-snug text-gray-900">{g.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="tr" />
    </div>
  );
}
