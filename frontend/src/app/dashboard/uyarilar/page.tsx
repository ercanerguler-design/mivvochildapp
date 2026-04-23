import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { redirect } from "next/navigation";

type AlertStatus = "PENDING" | "SEEN" | "RESOLVED" | "DISMISSED";

const statusColors: Record<AlertStatus, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  SEEN: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  DISMISSED: "bg-gray-100 text-gray-700",
};

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: AlertStatus }>;
}) {
  const locale = await getLocaleFromServerCookie();
  const text = t(locale);

  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: { children: { select: { id: true } } },
  });
  if (!parent) redirect("/kurulum");

  const params = await searchParams;
  const statusFilter = params.status;
  const childIds = parent.children.map((c) => c.id);

  const alerts = await db.alert.findMany({
    where: {
      childId: { in: childIds },
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      child: { select: { displayName: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{text.pages.alerts}</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["PENDING", "SEEN", "RESOLVED", "DISMISSED"] as AlertStatus[]).map((status) => (
          <a
            key={status}
            href={`/dashboard/uyarilar?status=${status}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColors[status]}`}
          >
            {status}
          </a>
        ))}
        <a href="/dashboard/uyarilar" className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-600">
          ALL
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {alerts.length === 0 ? (
          <div className="px-6 py-10 text-sm text-gray-500">No alerts found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.child.displayName}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.originalText}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(alert.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[alert.status]}`}>
                    {alert.status}
                  </span>
                  <p className="text-xs mt-2 text-gray-500">Risk: %{alert.riskScore}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
