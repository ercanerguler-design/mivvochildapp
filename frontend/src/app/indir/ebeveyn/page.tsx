import Link from "next/link";

const parentApkUrl =
  process.env.NEXT_PUBLIC_PARENT_APK_URL ??
  "https://expo.dev/accounts/scegrup/projects/mivvo-parent-app/builds";

export default function ParentDownloadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900">Mivvo Ebeveyn Uygulamasi</h1>
        <p className="mt-3 text-gray-600">
          Bu sayfa ebeveyn uygulamasini indirmek icin hazirlandi. Android cihazda butona basarak
          APK indirme sayfasina gecebilirsiniz.
        </p>

        <a
          href={parentApkUrl}
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Ebeveyn Uygulamasini Indir
        </a>

        <p className="mt-4 text-sm text-gray-500 break-all">Indirme linki: {parentApkUrl}</p>

        <div className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-500">
          Cocuk uygulamasi icin: <Link href="/indir/cocuk" className="text-blue-700 underline">/indir/cocuk</Link>
        </div>
      </div>
    </main>
  );
}
