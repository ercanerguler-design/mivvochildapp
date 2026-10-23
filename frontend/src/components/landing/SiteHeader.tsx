"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MivvoLogo } from "@/components/common/MivvoLogo";
import type { Locale } from "@/lib/i18n";

type NavLabels = { features: string; how: string; pricing: string; faq: string; guide: string; signIn: string; start: string; menu: string };

export function SiteHeader({ locale, nav }: { locale: Locale; nav: NavLabels }) {
  const [open, setOpen] = useState(false);
  const home = locale === "en" ? "/en" : "/";
  const links = [
    { href: `${home}#ozellikler`, label: nav.features },
    { href: `${home}#nasil-calisir`, label: nav.how },
    { href: `${home}#fiyat`, label: nav.pricing },
    { href: `${home}#sss`, label: nav.faq },
    ...(locale === "tr" ? [{ href: "/rehber", label: nav.guide }] : []),
  ];

  // Sets the cookie too, so the app area (login, dashboard) follows the chosen language.
  const switchTo = (next: Locale) => {
    document.cookie = `mivvo_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100/80 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={home} aria-label="Mivvo">
          <MivvoLogo size={32} textClassName="text-2xl" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-gray-600 lg:flex" aria-label="Ana menü">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-brand-600">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center rounded-lg border border-gray-200 p-0.5 text-xs font-semibold sm:flex">
            <Link href="/" onClick={() => switchTo("tr")} hrefLang="tr" className={`rounded-md px-2 py-1 ${locale === "tr" ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:bg-gray-100"}`}>TR</Link>
            <Link href="/en" onClick={() => switchTo("en")} hrefLang="en" className={`rounded-md px-2 py-1 ${locale === "en" ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:bg-gray-100"}`}>EN</Link>
          </div>
          <Link href="/giris" className="hidden text-sm font-semibold text-gray-700 hover:text-brand-600 sm:inline">
            {nav.signIn}
          </Link>
          <Link href="/kayit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700">
            {nav.start}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={nav.menu}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-gray-100 bg-white px-4 pb-4 lg:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobil menü">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 font-medium text-gray-700 hover:bg-gray-50">
                {l.label}
              </Link>
            ))}
            <Link href="/giris" className="rounded-lg px-2 py-3 font-medium text-gray-700 hover:bg-gray-50">{nav.signIn}</Link>
          </nav>
          <div className="flex gap-2 px-2 text-sm font-semibold">
            <Link href="/" onClick={() => switchTo("tr")} className={locale === "tr" ? "text-brand-700" : "text-gray-500"}>Türkçe</Link>
            <span className="text-gray-300">·</span>
            <Link href="/en" onClick={() => switchTo("en")} className={locale === "en" ? "text-brand-700" : "text-gray-500"}>English</Link>
          </div>
        </div>
      )}
    </header>
  );
}
