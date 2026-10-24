"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getLocaleFromClientCookie, type Locale } from "@/lib/i18n";

// Turkish-only legal documents render their own header.
const LEGAL_PATHS = new Set(["/gizlilik", "/kvkk", "/acik-riza", "/kullanim-kosullari", "/on-bilgilendirme", "/mesafeli-satis", "/iptal-iade", "/cerez-politikasi", "/guvenlik"]);

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const initialLocale = useMemo(() => getLocaleFromClientCookie(), []);
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocale(getLocaleFromClientCookie());
  }, [pathname]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<Locale>;
      if (customEvent.detail === "tr" || customEvent.detail === "en") {
        setLocale(customEvent.detail);
      }
    };

    window.addEventListener("mivvo-locale-change", handler);
    return () => window.removeEventListener("mivvo-locale-change", handler);
  }, []);

  function applyLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    document.cookie = `mivvo_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setLocale(nextLocale);
    window.dispatchEvent(new CustomEvent("mivvo-locale-change", { detail: nextLocale }));
    router.refresh();
  }

  // Marketing pages have their own URL-based language switch in the header.
  if (pathname === "/" || pathname === "/en" || pathname.startsWith("/en/") || pathname.startsWith("/rehber") || pathname.startsWith("/e/") || LEGAL_PATHS.has(pathname)) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 z-[80] sm:top-4">
    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 text-xs font-semibold text-gray-600">
      <button
        type="button"
        onClick={() => applyLocale("tr")}
        className={`rounded-md px-2 py-1 transition-colors ${locale === "tr" ? "bg-violet-100 text-violet-700" : "hover:bg-gray-100"}`}
      >
        TR
      </button>
      <button
        type="button"
        onClick={() => applyLocale("en")}
        className={`rounded-md px-2 py-1 transition-colors ${locale === "en" ? "bg-violet-100 text-violet-700" : "hover:bg-gray-100"}`}
      >
        EN
      </button>
    </div>
    </div>
  );
}
