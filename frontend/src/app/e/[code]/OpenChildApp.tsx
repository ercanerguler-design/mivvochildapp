"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, Smartphone } from "lucide-react";

export function OpenChildApp({ appLink, intentLink, code, downloadUrl, isAndroid }: { appLink: string; intentLink: string; code: string; downloadUrl: string; isAndroid: boolean }) {
  const [copied, setCopied] = useState(false);

  // Try to open the app straight away; if it isn't installed the buttons below stay available.
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.location.href = isAndroid ? intentLink : appLink;
    }, 300);
    return () => window.clearTimeout(t);
  }, [appLink, intentLink, isAndroid]);

  return (
    <div className="mt-3 space-y-4">
      <p className="text-gray-600">Uygulama açılıyor ve kod otomatik olarak dolduruluyor…</p>
      <a href={isAndroid ? intentLink : appLink} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 font-bold text-white">
        <Smartphone className="h-5 w-5" /> Mivvo Çocuk&apos;u aç
      </a>
      <a href={downloadUrl} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-3 text-sm font-bold text-gray-800">
        <Download className="h-4 w-4" /> Uygulama yüklü değilse indir
      </a>
      <div className="rounded-2xl bg-gray-50 p-4 text-left">
        <p className="text-xs font-semibold text-gray-500">Otomatik dolmazsa bu kodu uygulamaya yapıştır:</p>
        <p className="mt-1 break-all font-mono text-xs text-gray-800">{code}</p>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(code).catch(() => undefined);
            setCopied(true);
          }}
          className="mt-2 flex items-center gap-1.5 text-sm font-bold text-brand-600"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Kopyalandı" : "Kodu kopyala"}
        </button>
      </div>
    </div>
  );
}
