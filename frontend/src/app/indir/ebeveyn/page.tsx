import Link from "next/link";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";

const parentApkUrl =
  process.env.NEXT_PUBLIC_PARENT_APK_URL ??
  "https://expo.dev/accounts/scegrup/projects/mivvo-parent-app/builds";

const content = {
  tr: {
    title: "Mivvo Ebeveyn Uygulaması",
    desc: "Bu sayfa ebeveyn uygulamasını indirmek için hazırlandı. Android cihazda butona basarak APK indirme sayfasına geçebilirsiniz.",
    cta: "Ebeveyn Uygulamasını İndir",
    linkLabel: "İndirme linki",
    childRef: "Çocuk uygulaması için",
  },
  en: {
    title: "Mivvo Parent App",
    desc: "This page is prepared for downloading the parent app. On Android, tap the button to open the APK download page.",
    cta: "Download Parent App",
    linkLabel: "Download link",
    childRef: "For child app",
  },
} as const;

export default async function ParentDownloadPage() {
  const locale = await getLocaleFromServerCookie();
  const c = content[locale];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-end">
          <LanguageSwitcher />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900">{c.title}</h1>
        <p className="mt-3 text-gray-600">{c.desc}</p>

        <a
          href={parentApkUrl}
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          {c.cta}
        </a>

        <p className="mt-4 text-sm text-gray-500 break-all">{c.linkLabel}: {parentApkUrl}</p>

        <div className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-500">
          {c.childRef}: <Link href="/indir/cocuk" className="text-blue-700 underline">/indir/cocuk</Link>
        </div>
      </div>
    </main>
  );
}
