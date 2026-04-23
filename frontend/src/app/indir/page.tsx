import Link from "next/link";

export default function DownloadHubPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white px-4 py-16">
      <div className="mx-auto max-w-4xl rounded-2xl border border-violet-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900">Mivvo Uygulama Indirme Merkezi</h1>
        <p className="mt-3 text-gray-600">
          Dogru uygulamayi secip tek tikla indirme sayfasina gecin.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href="/indir/cocuk"
            className="rounded-xl border border-violet-200 bg-violet-50 p-5 transition hover:border-violet-300 hover:bg-violet-100"
          >
            <h2 className="text-xl font-bold text-violet-800">Cocuk Uygulamasi</h2>
            <p className="mt-2 text-sm text-violet-700">
              Cocuk cihazina kurulacak uygulama sayfasina git.
            </p>
          </Link>

          <Link
            href="/indir/ebeveyn"
            className="rounded-xl border border-blue-200 bg-blue-50 p-5 transition hover:border-blue-300 hover:bg-blue-100"
          >
            <h2 className="text-xl font-bold text-blue-800">Ebeveyn Uygulamasi</h2>
            <p className="mt-2 text-sm text-blue-700">
              Ebeveyn cihazina kurulacak uygulama sayfasina git.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
