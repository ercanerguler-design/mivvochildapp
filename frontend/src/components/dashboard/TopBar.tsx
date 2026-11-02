"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { setLocaleCookie, t, type Locale } from "@/lib/i18n";
import { navItems } from "./Sidebar";

type Props = { locale: Locale; title: string; email: string; initial: string };

/** Dashboard top bar: title, language, account and sign-out; on phones also the page links. */
export function TopBar({ locale, title, email, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const text = t(locale);

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    setLocaleCookie(next);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <h1 className="truncate text-base font-semibold text-gray-800">{title}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-200 p-0.5 text-xs font-semibold" role="group" aria-label="Dil / Language">
            {(["tr", "en"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLocale(l)} aria-pressed={locale === l} className={`rounded-md px-2 py-1 ${locale === l ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100"}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="hidden max-w-[220px] truncate text-sm text-gray-500 lg:inline">{email}</span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700" aria-hidden="true">{initial}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/giris" })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{text.sidebar.signOut}</span>
          </button>
        </div>
      </div>
      {/* Phones have no sidebar: the pages are listed under the bar. */}
      <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-3 py-2 md:hidden" aria-label="Panel menüsü">
        {navItems.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${active ? "bg-violet-50 text-violet-700" : "text-gray-600"}`}>
              <item.icon className="h-4 w-4" />
              {text.sidebar[item.key as keyof typeof text.sidebar]}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
