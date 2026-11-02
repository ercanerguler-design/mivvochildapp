import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { auth } from "@/lib/auth";
import { hasCurrentConsents } from "@/lib/consents";
import { t } from "@/lib/i18n";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { validName } from "@/lib/phone";

export const metadata: Metadata = { title: "Ebeveyn Paneli", robots: { index: false, follow: false } };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocaleFromServerCookie();
  const text = t(locale);

  const session = await auth();
  if (!session?.user) redirect("/giris");

  // Users who signed up with Google, or before the current legal texts, accept them once.
  // Google sign-ups and older accounts also complete their name and mobile number there.
  const consented = session.user.id ? await hasCurrentConsents(session.user.id).catch(() => true) : true;
  const profile = session.user.id ? await db.user.findUnique({ where: { id: session.user.id }, select: { name: true, phone: true } }).catch(() => null) : null;
  if (!consented || (profile && (!profile.phone || !profile.name || !validName(profile.name)))) redirect("/onay");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar locale={locale} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          locale={locale}
          title={text.dashboard.panelTitle}
          email={session.user.email ?? ""}
          initial={session.user.name?.charAt(0).toUpperCase() ?? text.dashboard.parentDefaultName.charAt(0)}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
