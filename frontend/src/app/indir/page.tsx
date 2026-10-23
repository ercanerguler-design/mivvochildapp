import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";

export const metadata: Metadata = { title: "Uygulamayı İndir", description: "Mivvo Ebeveyn ve Mivvo Çocuk uygulamalarını indirin. Ebeveyn uygulaması Google Play'de.", alternates: { canonical: "/indir" } };

const childApkUrl =
  process.env.NEXT_PUBLIC_CHILD_APK_URL ??
  "/api/download/child";

const parentApkUrl =
  process.env.NEXT_PUBLIC_PARENT_APK_URL ??
  "/api/download/parent";

const content = {
  tr: {
    title: "Mivvo Uygulama İndirme Merkezi",
    desc: "Doğru uygulamayı seçip tek tıkla indirme sayfasına geçin.",
    childTitle: "Çocuk Uygulaması",
    childDesc: "Çocuk cihazına kurulacak uygulama sayfasına git.",
    parentTitle: "Ebeveyn Uygulaması",
    parentDesc: "Ebeveyn cihazına kurulacak uygulama sayfasına git.",
  },
  en: {
    title: "Mivvo App Download Center",
    desc: "Choose the correct app and continue to the download page in one tap.",
    childTitle: "Child App",
    childDesc: "Go to the app page to install on the child's device.",
    parentTitle: "Parent App",
    parentDesc: "Go to the app page to install on the parent's device.",
  },
} as const;

export default async function DownloadHubPage() {
  const locale = await getLocaleFromServerCookie();
  const c = content[locale];

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white px-4 py-16">
      <div className="mx-auto max-w-4xl rounded-2xl border border-violet-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900">{c.title}</h1>
        <p className="mt-3 text-gray-600">{c.desc}</p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <a
            href={childApkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-violet-200 bg-violet-50 p-5 transition hover:border-violet-300 hover:bg-violet-100"
          >
            <h2 className="text-xl font-bold text-violet-800">{c.childTitle}</h2>
            <p className="mt-2 text-sm text-violet-700">{c.childDesc}</p>
          </a>

          <a
            href={parentApkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-blue-200 bg-blue-50 p-5 transition hover:border-blue-300 hover:bg-blue-100"
          >
            <h2 className="text-xl font-bold text-blue-800">{c.parentTitle}</h2>
            <p className="mt-2 text-sm text-blue-700">{c.parentDesc}</p>
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            Child: <Link href="/indir/cocuk" className="underline">/indir/cocuk</Link>
          </p>
          <p>
            Parent: <Link href="/indir/ebeveyn" className="underline">/indir/ebeveyn</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
