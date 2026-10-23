import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Printer } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { landingContent } from "@/components/landing/content";
import { getLegalDoc, legalDocs, type LegalBlock } from "@/lib/legal";

export function legalMetadata(slug: string): Metadata {
  const doc = getLegalDoc(slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description, alternates: { canonical: `/${doc.slug}` }, openGraph: { url: `/${doc.slug}` } };
}

const anchor = (i: number) => `bolum-${i + 1}`;

function Block({ b }: { b: LegalBlock }) {
  if ("p" in b) return <p className="mt-4 leading-7 text-gray-700">{b.p}</p>;
  if ("ul" in b)
    return (
      <ul className="mt-4 space-y-2.5">
        {b.ul.map((i) => (
          <li key={i} className="flex gap-3 leading-7 text-gray-700">
            <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            {i}
          </li>
        ))}
      </ul>
    );
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl ring-1 ring-gray-200">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-gray-50 text-gray-900">
          <tr>{b.table.head.map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {b.table.rows.map((r) => (
            <tr key={r.join("|")}>{r.map((c, i) => <td key={i} className={`px-4 py-3 align-top ${i === 0 ? "font-semibold text-gray-900" : "text-gray-600"}`}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalPage({ slug }: { slug: string }) {
  const doc = getLegalDoc(slug);
  if (!doc) notFound();
  const updated = new Date(doc.updated).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader locale="tr" nav={landingContent.tr.nav} />
      <main className="flex-1">
        <div className="border-b border-gray-100 bg-gradient-to-b from-brand-50 to-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <p className="flex items-center gap-2 text-sm font-bold text-brand-600"><FileText className="h-4 w-4" /> Yasal belgeler</p>
            <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">{doc.title}</h1>
            <p className="mt-3 text-sm text-gray-500">Sürüm {doc.version} · Son güncelleme: <time dateTime={doc.updated}>{updated}</time></p>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav aria-label="Yasal belgeler" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              {legalDocs.map((d) => (
                <Link
                  key={d.slug}
                  href={`/${d.slug}`}
                  aria-current={d.slug === doc.slug ? "page" : undefined}
                  className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${d.slug === doc.slug ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {d.short}
                </Link>
              ))}
            </nav>
            {doc.sections.length > 3 && (
              <div className="mt-6 hidden lg:block">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Bu sayfada</p>
                <ol className="space-y-1.5 text-sm">
                  {doc.sections.map((s, i) => (
                    <li key={s.h}><a href={`#${anchor(i)}`} className="text-gray-500 hover:text-brand-600">{s.h}</a></li>
                  ))}
                </ol>
              </div>
            )}
          </aside>

          <article className="max-w-3xl">
            {doc.sections.map((s, i) => (
              <section key={s.h} id={anchor(i)} className="scroll-mt-24 border-b border-gray-100 pb-8 pt-2 last:border-0 [&+section]:mt-8">
                <h2 className="font-display text-xl font-black text-gray-900">{s.h}</h2>
                {s.blocks.map((b, j) => <Block key={j} b={b} />)}
              </section>
            ))}
            <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl bg-gray-50 p-5 text-sm text-gray-600">
              <Printer className="h-5 w-5 text-gray-400" />
              <span className="flex-1">Bu belgeyi tarayıcınızın yazdır menüsünden PDF olarak kaydedebilirsiniz. Sorularınız için <a className="font-semibold text-brand-600" href="mailto:sce@scegrup.com">sce@scegrup.com</a>.</span>
            </div>
          </article>
        </div>
      </main>
      <SiteFooter locale="tr" />
    </div>
  );
}
