"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  BarChart3,
  Smartphone,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/uyarilar", label: "Uyarılar", icon: Bell },
  { href: "/dashboard/sosyal-medya", label: "Sosyal Medya", icon: Smartphone },
  { href: "/dashboard/cocuklar", label: "Çocuklarım", icon: Users },
  { href: "/dashboard/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/dashboard/ayarlar", label: "Ayarlar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 min-h-screen">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-100">
        <ShieldCheck className="w-6 h-6 text-violet-600" />
        <span className="font-bold text-gray-900 text-lg">Mivvo</span>
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
