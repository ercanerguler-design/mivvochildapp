import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { createPairingCode, getPairingTtlMinutes } from "@/lib/pairing";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const categoryLabels: Record<"tr" | "en", Record<string, string>> = {
  tr: {
    BULLYING: "Zorbalık",
    VIOLENCE: "Şiddet",
    SEXUAL_RISK: "Cinsel Risk",
    THREAT: "Tehdit",
    PROFANITY: "Küfür",
    EXTREME_ANGER: "Aşırı Öfke",
  },
  en: {
    BULLYING: "Bullying",
    VIOLENCE: "Violence",
    SEXUAL_RISK: "Sexual Risk",
    THREAT: "Threat",
    PROFANITY: "Profanity",
    EXTREME_ANGER: "Extreme Anger",
  },
};

const categoryColors: Record<string, string> = {
  BULLYING: "bg-rose-100 text-rose-700",
  VIOLENCE: "bg-red-100 text-red-700",
  SEXUAL_RISK: "bg-purple-100 text-purple-700",
  THREAT: "bg-orange-100 text-orange-700",
  PROFANITY: "bg-yellow-100 text-yellow-700",
  EXTREME_ANGER: "bg-pink-100 text-pink-700",
};

export default async function DashboardPage() {
  const locale = await getLocaleFromServerCookie();
  const text = t(locale);

  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      children: {
        include: {
          alerts: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      },
    },
  });

  if (!parent) redirect("/kurulum");

  const allAlerts = parent.children.flatMap((c) => c.alerts);
  const highRiskCount = allAlerts.filter((a) => a.riskScore >= 80 && a.status !== "RESOLVED").length;
  const pendingCount = allAlerts.filter((a) => a.status === "PENDING").length;
  const resolvedCount = allAlerts.filter((a) => a.status === "RESOLVED").length;
  const totalCount = allAlerts.length;
  const safetyScore = Math.max(0, Math.min(100, 100 - pendingCount * 8 - highRiskCount * 12));
  const pairingCode = createPairingCode(parent.id);
  const pairingTtl = getPairingTtlMinutes();

  const recentAlerts = allAlerts
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const stats = [
    {
      label: text.dashboard.stats.total,
      value: totalCount,
      icon: AlertTriangle,
      color: "bg-violet-100 text-violet-600",
    },
    {
      label: text.dashboard.stats.pending,
      value: pendingCount,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: text.dashboard.stats.resolved,
      value: resolvedCount,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: text.dashboard.stats.childCount,
      value: parent.children.length,
      icon: ShieldCheck,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {text.dashboard.welcome}, {session.user.name ?? text.dashboard.parentDefaultName} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {text.dashboard.summaryText}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">{text.dashboard.securityScore}</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">{safetyScore}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${safetyScore >= 80 ? "bg-emerald-500" : safetyScore >= 50 ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${safetyScore}%` }} />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {safetyScore >= 80
              ? text.dashboard.securityHealthy
              : safetyScore >= 50
              ? text.dashboard.securityMedium
              : text.dashboard.securityCritical}
          </p>
        </div>

        <div className="bg-linear-to-br from-violet-600 to-blue-600 text-white rounded-2xl p-5">
          <p className="text-violet-100 text-sm">{text.dashboard.pairingTitle}</p>
          <p className="font-bold text-lg break-all mt-2">{pairingCode}</p>
          <p className="text-xs text-violet-100 mt-2">
            {text.dashboard.pairingExpires}: {pairingTtl} dk
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">{text.dashboard.quickActions}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a href="/dashboard/uyarilar" className="rounded-xl border border-gray-200 px-4 py-3 hover:border-violet-300 hover:bg-violet-50 transition-colors text-sm font-medium text-gray-700">
            {text.dashboard.quickActionAlerts}
          </a>
          <a href="/dashboard/cocuklar" className="rounded-xl border border-gray-200 px-4 py-3 hover:border-violet-300 hover:bg-violet-50 transition-colors text-sm font-medium text-gray-700">
            {text.dashboard.quickActionChildren}
          </a>
          <a href="/dashboard/ayarlar" className="rounded-xl border border-gray-200 px-4 py-3 hover:border-violet-300 hover:bg-violet-50 transition-colors text-sm font-medium text-gray-700">
            {text.dashboard.quickActionSettings}
          </a>
        </div>
      </div>

      {/* RECENT ALERTS */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{text.dashboard.recentAlerts}</h3>
          <a href="/dashboard/uyarilar" className="text-sm text-violet-600 hover:underline">
            {text.dashboard.viewAll}
          </a>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{text.dashboard.noAlerts}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentAlerts.map((alert) => {
              const child = parent.children.find((c) =>
                c.alerts.some((a) => a.id === alert.id)
              );
              return (
                <div key={alert.id} className="px-6 py-4 flex items-start gap-4">
                  <div
                    className={`mt-0.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      categoryColors[alert.category] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {categoryLabels[locale][alert.category] ?? alert.category}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{alert.originalText}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {child?.displayName} •{" "}
                      {new Date(alert.createdAt).toLocaleDateString("tr-TR", {
                        ...(locale === "en" ? { weekday: undefined } : {}),
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        alert.riskScore >= 80
                          ? "bg-red-100 text-red-600"
                          : alert.riskScore >= 50
                          ? "bg-orange-100 text-orange-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      %{alert.riskScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHILDREN */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{text.dashboard.children}</h3>
          <a href="/dashboard/cocuklar" className="text-sm text-violet-600 hover:underline">
            {text.dashboard.manage}
          </a>
        </div>
        <div className="divide-y divide-gray-50">
          {parent.children.map((child) => {
            const childPending = child.alerts.filter((a) => a.status === "PENDING").length;
            return (
              <div key={child.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
                  {child.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{child.displayName}</p>
                  <p className="text-xs text-gray-400">
                    {child.isActive ? text.dashboard.activeProtection : text.dashboard.passiveProtection}
                  </p>
                </div>
                {childPending > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    {childPending} {text.dashboard.pendingSuffix}
                  </span>
                )}
                <TrendingUp className="w-4 h-4 text-gray-300" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
