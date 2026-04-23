import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { redirect } from "next/navigation";

export default async function ChildrenPage() {
  const locale = await getLocaleFromServerCookie();
  const text = t(locale);

  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      children: {
        include: {
          _count: {
            select: {
              alerts: true,
              contacts: true,
              socialActivities: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!parent) redirect("/kurulum");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{text.pages.children}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parent.children.map((child) => (
          <div key={child.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{child.displayName}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${child.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                {child.isActive ? "Active" : "Passive"}
              </span>
            </div>
            <p className="text-xs text-gray-500">Device ID: {child.deviceId ?? "-"}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-violet-50 p-2">
                <p className="text-gray-500">Alerts</p>
                <p className="font-bold text-violet-700">{child._count.alerts}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2">
                <p className="text-gray-500">Contacts</p>
                <p className="font-bold text-blue-700">{child._count.contacts}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2">
                <p className="text-gray-500">Activities</p>
                <p className="font-bold text-emerald-700">{child._count.socialActivities}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
