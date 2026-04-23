import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const locale = await getLocaleFromServerCookie();
  const text = t(locale);

  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: { children: { select: { id: true } } },
  });
  if (!parent) redirect("/kurulum");

  const childIds = parent.children.map((c) => c.id);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [categoryCounts, platformCounts] = await Promise.all([
    db.alert.groupBy({
      by: ["category"],
      where: { childId: { in: childIds }, createdAt: { gte: since7d } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    db.alert.groupBy({
      by: ["platform"],
      where: { childId: { in: childIds }, createdAt: { gte: since7d }, platform: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{text.pages.reports}</h2>
      <p className="text-sm text-gray-500">Last 7 days summary</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">By Category</h3>
          <div className="space-y-2">
            {categoryCounts.length === 0 && <p className="text-sm text-gray-500">No data.</p>}
            {categoryCounts.map((row) => (
              <div key={row.category} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{row.category}</span>
                <span className="font-semibold text-gray-900">{row._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">By Platform</h3>
          <div className="space-y-2">
            {platformCounts.length === 0 && <p className="text-sm text-gray-500">No data.</p>}
            {platformCounts.map((row) => (
              <div key={row.platform} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{row.platform}</span>
                <span className="font-semibold text-gray-900">{row._count.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
