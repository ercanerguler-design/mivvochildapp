import Link from "next/link";

const childApkUrl =
  process.env.NEXT_PUBLIC_CHILD_APK_URL ??
  "https://expo.dev/accounts/scegrup/projects/mivvo-child-app/builds";

export default function ChildDownloadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-violet-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900">Mivvo Cocuk Uygulamasi</h1>
        <p className="mt-3 text-gray-600">
          Bu sayfa cocuk uygulamasini indirmek icin hazirlandi. Android cihazda butona basarak
          APK indirme sayfasina gecebilirsiniz.
        </p>

        <a
          href={childApkUrl}
          className="mt-6 inline-flex rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
        >
          Cocuk Uygulamasini Indir
        </a>

        <p className="mt-4 text-sm text-gray-500 break-all">Indirme linki: {childApkUrl}</p>

        <div className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-500">
          Ebeveyn uygulamasi icin: <Link href="/indir/ebeveyn" className="text-violet-700 underline">/indir/ebeveyn</Link>
        </div>
      </div>
    </main>
  );
}
