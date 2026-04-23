"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getLocaleFromClientCookie, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const router = useRouter();
  const initialLocale = useMemo(() => getLocaleFromClientCookie(), []);
  const [locale, setLocale] = useState<Locale>(initialLocale);

  function applyLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    document.cookie = `mivvo_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setLocale(nextLocale);
    router.refresh();
  }

  return (
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
  );
}
