"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { getLocaleFromClientCookie, t } from "@/lib/i18n";
import { MivvoLogo } from "@/components/common/MivvoLogo";
import {
  LayoutDashboard,
  Bell,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Smartphone,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboard },
  { href: "/dashboard/uyarilar", key: "alerts", icon: Bell },
  { href: "/dashboard/sosyal-medya", key: "social", icon: Smartphone },
  { href: "/dashboard/cocuklar", key: "children", icon: Users },
  { href: "/dashboard/raporlar", key: "reports", icon: BarChart3 },
  { href: "/dashboard/ayarlar", key: "settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const locale = getLocaleFromClientCookie();
  const text = t(locale);

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 min-h-screen">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-100">
        <MivvoLogo size={26} textClassName="text-lg" />
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-violet-50 text-violet-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {text.sidebar[item.key as keyof typeof text.sidebar]}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/giris" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {text.sidebar.signOut}
        </button>
      </div>
    </aside>
  );
}
