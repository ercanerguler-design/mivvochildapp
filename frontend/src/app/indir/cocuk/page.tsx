import Link from "next/link";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";

const childApkUrl =
  process.env.NEXT_PUBLIC_CHILD_APK_URL ??
  "https://expo.dev/accounts/scegrup/projects/mivvo-child-app/builds";

const content = {
  tr: {
    title: "Mivvo Çocuk Uygulaması",
    desc: "Bu sayfa çocuk uygulamasını indirmek için hazırlandı. Android cihazda butona basarak APK indirme sayfasına geçebilirsiniz.",
    cta: "Çocuk Uygulamasını İndir",
    linkLabel: "İndirme linki",
    parentRef: "Ebeveyn uygulaması için",
  },
  en: {
    title: "Mivvo Child App",
    desc: "This page is prepared for downloading the child app. On Android, tap the button to open the APK download page.",
    cta: "Download Child App",
    linkLabel: "Download link",
    parentRef: "For parent app",
  },
} as const;

export default async function ChildDownloadPage() {
  const locale = await getLocaleFromServerCookie();
  const c = content[locale];

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-violet-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900">{c.title}</h1>
        <p className="mt-3 text-gray-600">{c.desc}</p>

        <a
          href={childApkUrl}
          className="mt-6 inline-flex rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
        >
          {c.cta}
        </a>

        <p className="mt-4 text-sm text-gray-500 break-all">{c.linkLabel}: {childApkUrl}</p>

        <div className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-500">
          {c.parentRef}: <Link href="/indir/ebeveyn" className="text-violet-700 underline">/indir/ebeveyn</Link>
        </div>
      </div>
    </main>
  );
}
