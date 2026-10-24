import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MivvoMark } from "@/components/common/MivvoLogo";
import { verifyPairingCode } from "@/lib/pairing";
import { SITE } from "@/lib/site";
import { OpenChildApp } from "./OpenChildApp";

export const metadata: Metadata = { title: "Mivvo Çocuk ile eşleştir", robots: { index: false, follow: false } };

/**
 * Landing page behind the pairing QR code. Scanned with the child's normal camera app, it opens
 * Mivvo Çocuk with the code filled in (mivvochild://pair?code=...), or offers the download.
 */
export default async function PairLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(code)) notFound();
  const valid = verifyPairingCode(code).valid;
  const isAndroid = /android/i.test((await headers()).get("user-agent") ?? "");

  const appLink = `mivvochild://pair?code=${encodeURIComponent(code)}`;
  // Android intent link: opens the app if installed, otherwise falls back to the download page.
  const fallback = encodeURIComponent(`${SITE.url}/indir/cocuk`);
  const intentLink = `intent://pair?code=${encodeURIComponent(code)}#Intent;scheme=mivvochild;package=org.mivvo.child;S.browser_fallback_url=${fallback};end`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-brand-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl ring-1 ring-gray-100">
        <div className="flex justify-center"><MivvoMark size={56} variant="child" /></div>
        <h1 className="mt-5 font-display text-2xl font-black text-gray-900">Mivvo Çocuk ile eşleştir</h1>
        {valid ? (
          <OpenChildApp isAndroid={isAndroid} appLink={appLink} intentLink={intentLink} code={code} downloadUrl={`${SITE.url}/indir/cocuk`} />
        ) : (
          <>
            <p className="mt-3 text-gray-600">Bu eşleştirme kodunun süresi dolmuş. Ebeveyninden yeni bir QR kod göstermesini iste.</p>
            <a href={`${SITE.url}/indir/cocuk`} className="mt-6 inline-block text-sm font-semibold text-brand-600 underline">Mivvo Çocuk&apos;u indir</a>
          </>
        )}
      </div>
    </main>
  );
}
