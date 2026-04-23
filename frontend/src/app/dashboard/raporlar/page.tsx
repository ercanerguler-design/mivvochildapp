import { auth } from "@/lib/auth";
import { generateCoachingInsights } from "@/lib/coaching";
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

  const categoryMap = Object.fromEntries(categoryCounts.map((row) => [row.category, row._count.id]));
  const totalAlerts = categoryCounts.reduce((acc, row) => acc + row._count.id, 0);
  const bullyingCount = categoryMap.BULLYING ?? 0;
  const aggressiveCount = (categoryMap.EXTREME_ANGER ?? 0) + (categoryMap.PROFANITY ?? 0);

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const nightRiskCount = await db.socialActivity.count({
    where: {
      childId: { in: childIds },
      isNightTime: true,
      createdAt: { gte: since24h },
    },
  });

  const behaviorScore = Math.max(0, 100 - bullyingCount * 10 - aggressiveCount * 6 - nightRiskCount * 4);
  const toneReactive = aggressiveCount >= 3;
  const bullyingHigh = bullyingCount >= 2;
  const nightRiskActive = nightRiskCount >= 3;

  const behaviorHint =
    behaviorScore >= 80
      ? text.reportsPage.behaviorScoreHigh
      : behaviorScore >= 50
      ? text.reportsPage.behaviorScoreMedium
      : text.reportsPage.behaviorScoreLow;

  const topCategory = categoryCounts[0]?.category ?? null;
  const topPlatform = platformCounts[0]?.platform ?? null;

  const coaching = await generateCoachingInsights(locale, {
    totalAlerts,
    behaviorScore,
    bullyingCount,
    aggressiveCount,
    nightRiskCount,
    topCategory,
    topPlatform,
  });

  const platformLabels: Record<string, string> = {
    INSTAGRAM: "Instagram",
    SNAPCHAT: "Snapchat",
    TIKTOK: "TikTok",
    WHATSAPP: "WhatsApp",
    TELEGRAM: "Telegram",
    SMS: "SMS",
    OTHER: "Other",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{text.pages.reports}</h2>
      <p className="text-sm text-gray-500">{text.reportsPage.summary7d}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-2">{text.reportsPage.behaviorScoreTitle}</h3>
          <p className="text-4xl font-bold text-gray-900">{behaviorScore}</p>
          <p className="text-sm text-gray-600 mt-2">{behaviorHint}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900">{text.reportsPage.talkModelTitle}</h3>
            <p className="text-sm text-gray-600 mt-1">{coaching.talkSuggestion}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{text.reportsPage.familyCoachTitle}</h3>
            <p className="text-sm text-gray-600 mt-1">{coaching.familyCoachSuggestion}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">{text.reportsPage.toneAnalysisTitle}</h3>
          <p className={`text-sm font-semibold ${toneReactive ? "text-orange-700" : "text-emerald-700"}`}>
            {toneReactive ? text.reportsPage.toneAnalysisReactive : text.reportsPage.toneAnalysisCalm}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">{text.reportsPage.schoolBullyingTitle}</h3>
          <p className={`text-sm font-semibold ${bullyingHigh ? "text-red-700" : "text-emerald-700"}`}>
            {bullyingHigh ? text.reportsPage.schoolBullyingHigh : text.reportsPage.schoolBullyingLow}
          </p>
          <p className="text-xs text-gray-500 mt-1">{text.reportsPage.categories.BULLYING}: {bullyingCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">{text.reportsPage.nightRiskTitle}</h3>
          <p className={`text-sm font-semibold ${nightRiskActive ? "text-red-700" : "text-emerald-700"}`}>
            {nightRiskActive ? text.reportsPage.nightRiskActive : text.reportsPage.nightRiskPassive}
          </p>
          <p className="text-xs text-gray-500 mt-1">24h: {nightRiskCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">{text.reportsPage.byCategory}</h3>
          <div className="space-y-2">
            {categoryCounts.length === 0 && <p className="text-sm text-gray-500">{text.reportsPage.noData}</p>}
            {categoryCounts.map((row) => (
              <div key={row.category} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{text.reportsPage.categories[row.category as keyof typeof text.reportsPage.categories] ?? row.category}</span>
                <span className="font-semibold text-gray-900">{row._count.id}</span>
              </div>
            ))}
            {totalAlerts > 0 && <p className="text-xs text-gray-400 pt-1">Total: {totalAlerts}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">{text.reportsPage.byPlatform}</h3>
          <div className="space-y-2">
            {platformCounts.length === 0 && <p className="text-sm text-gray-500">{text.reportsPage.noData}</p>}
            {platformCounts.map((row) => (
              <div key={row.platform} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{(row.platform && platformLabels[row.platform]) ?? row.platform}</span>
                <span className="font-semibold text-gray-900">{row._count.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
