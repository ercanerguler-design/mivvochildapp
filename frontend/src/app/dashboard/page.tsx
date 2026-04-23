import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

const categoryLabels: Record<string, string> = {
  BULLYING: "Zorbalık",
  VIOLENCE: "Şiddet",
  SEXUAL_RISK: "Cinsel Risk",
  THREAT: "Tehdit",
  PROFANITY: "Küfür",
  EXTREME_ANGER: "Aşırı Öfke",
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
  const pendingCount = allAlerts.filter((a) => a.status === "PENDING").length;
  const resolvedCount = allAlerts.filter((a) => a.status === "RESOLVED").length;
  const totalCount = allAlerts.length;

  const recentAlerts = allAlerts
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const stats = [
    {
      label: "Toplam Uyarı",
      value: totalCount,
      icon: AlertTriangle,
      color: "bg-violet-100 text-violet-600",
    },
    {
      label: "Bekleyen",
      value: pendingCount,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Çözüldü",
      value: resolvedCount,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Takip Edilen Çocuk",
      value: parent.children.length,
      icon: ShieldCheck,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Hoş geldiniz, {session.user.name ?? "Ebeveyn"} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Çocuklarınızın dijital güvenlik durumu aşağıda özetlenmiştir.
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

      {/* RECENT ALERTS */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Son Uyarılar</h3>
          <a href="/dashboard/uyarilar" className="text-sm text-violet-600 hover:underline">
            Tümünü Gör
          </a>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Henüz uyarı yok. Her şey yolunda!</p>
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
                    {categoryLabels[alert.category] ?? alert.category}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{alert.originalText}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {child?.displayName} •{" "}
                      {new Date(alert.createdAt).toLocaleDateString("tr-TR", {
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
          <h3 className="font-semibold text-gray-900">Çocuklarım</h3>
          <a href="/dashboard/cocuklar" className="text-sm text-violet-600 hover:underline">
            Yönet
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
                    {child.isActive ? "Aktif koruma" : "Pasif"}
                  </p>
                </div>
                {childPending > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    {childPending} bekleyen
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
