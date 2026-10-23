import { NextRequest, NextResponse } from "next/server";
import { AlertStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireMobileParent } from "@/lib/mobile-parent-request";
import { getParentBillingStatus, MONTHLY_PLAN_TL } from "@/lib/subscription";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Everything the parent app's home screen needs in one request. */
export async function GET(req: NextRequest) {
  const auth = requireMobileParent(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parent = await db.parentProfile.findUnique({
    where: { id: auth.parentId },
    select: {
      id: true,
      sensitivityLevel: true,
      user: { select: { name: true, email: true } },
      children: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, displayName: true, birthDate: true, updatedAt: true, createdAt: true },
      },
    },
  });
  if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });

  const childIds = parent.children.map((c) => c.id);
  const since = new Date(Date.now() - 7 * DAY_MS);

  const [pending, weekAlerts, billing] = await Promise.all([
    db.alert.count({ where: { childId: { in: childIds }, status: AlertStatus.PENDING } }),
    db.alert.findMany({
      where: { childId: { in: childIds }, createdAt: { gte: since } },
      select: { childId: true, category: true, riskScore: true, createdAt: true },
    }),
    getParentBillingStatus(parent.id),
  ]);

  // Alerts per day for the last 7 days (oldest first).
  const daily = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(Date.now() - (6 - i) * DAY_MS);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + DAY_MS);
    return { date: start.toISOString(), count: weekAlerts.filter((a) => a.createdAt >= start && a.createdAt < end).length };
  });

  const byCategory: Record<string, number> = {};
  for (const a of weekAlerts) byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;

  return NextResponse.json({
    parent: { name: parent.user.name, email: parent.user.email, sensitivityLevel: parent.sensitivityLevel },
    children: parent.children.map((c) => ({
      id: c.id,
      displayName: c.displayName,
      birthDate: c.birthDate,
      lastSeenAt: c.updatedAt,
      weekAlerts: weekAlerts.filter((a) => a.childId === c.id).length,
      highRisk: weekAlerts.filter((a) => a.childId === c.id && a.riskScore >= 85).length,
    })),
    stats: { pending, weekTotal: weekAlerts.length, highRisk: weekAlerts.filter((a) => a.riskScore >= 85).length, daily, byCategory },
    billing: {
      trialActive: billing.trial.active,
      trialDaysRemaining: billing.trial.daysRemaining ?? 0,
      subscriptionActive: billing.unlimited.active,
      subscriptionExpiresAt: billing.unlimited.expiresAt,
      monthlyPriceTl: MONTHLY_PLAN_TL,
    },
  });
}
