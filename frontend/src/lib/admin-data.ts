import { db } from "@/lib/db";
import { FREE_TRIAL_DAYS, MONTHLY_PLAN_TL } from "@/lib/subscription";

/**
 * Admin analytics. Revenue comes from parent_subscription_ledger (every activation, card or
 * bank transfer, writes one row with its amount); expenses from admin_expenses.
 */

const DAY = 24 * 60 * 60 * 1000;

export const EXPENSE_CATEGORIES = [
  "Sunucu (Vercel)",
  "Veritabanı (Neon)",
  "Yapay zekâ (OpenAI)",
  "Uygulama (Expo/EAS)",
  "Google Play",
  "Ödeme komisyonu (iyzico)",
  "Pazarlama / Reklam",
  "Personel",
  "Muhasebe / Hukuk",
  "Diğer",
] as const;

let ready = false;
export async function ensureAdminTables() {
  if (ready) return;
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS parent_subscription_ledger (
      id TEXT PRIMARY KEY, parent_id TEXT NOT NULL, days INTEGER NOT NULL, amount_tl INTEGER NOT NULL,
      reason TEXT, actor TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS parent_unlimited_plans (
      parent_id TEXT PRIMARY KEY, starts_at TIMESTAMPTZ NOT NULL, expires_at TIMESTAMPTZ NOT NULL,
      reason TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS admin_expenses (
      id TEXT PRIMARY KEY, spent_on DATE NOT NULL, category TEXT NOT NULL, description TEXT,
      amount_tl NUMERIC(12,2) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS download_events (
      id TEXT PRIMARY KEY, app TEXT NOT NULL, user_agent TEXT, ip TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  ready = true;
}

export type MemberStatus = "trial" | "trial_expired" | "paid" | "paid_expired";

export const STATUS_LABEL: Record<MemberStatus, string> = {
  trial: "Deneme",
  trial_expired: "Deneme bitti",
  paid: "Ücretli",
  paid_expired: "Abonelik bitti",
};

export type Member = {
  parentId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  status: MemberStatus;
  trialEndsAt: string;
  planExpiresAt: string | null;
  totalPaidTl: number;
  paymentCount: number;
  children: number;
  lastDeviceSeenAt: string | null;
  alerts30d: number;
};

export async function loadMembers(): Promise<Member[]> {
  await ensureAdminTables();
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY);

  const [parents, plans, payments, alertCounts] = await Promise.all([
    db.parentProfile.findMany({
      select: {
        id: true,
        createdAt: true,
        user: { select: { name: true, email: true, phone: true } },
        children: { where: { isActive: true }, select: { id: true, updatedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.$queryRawUnsafe<{ parent_id: string; expires_at: Date }[]>(`SELECT parent_id, expires_at FROM parent_unlimited_plans`),
    db.$queryRawUnsafe<{ parent_id: string; total: number; count: number }[]>(
      `SELECT parent_id, COALESCE(SUM(amount_tl),0)::int AS total, COUNT(*)::int AS count FROM parent_subscription_ledger WHERE amount_tl > 0 GROUP BY parent_id`
    ),
    db.alert.groupBy({ by: ["childId"], where: { createdAt: { gte: since30 } }, _count: { _all: true } }),
  ]);

  const planBy = new Map(plans.map((p) => [p.parent_id, p.expires_at]));
  const payBy = new Map(payments.map((p) => [p.parent_id, p]));
  const alertsByChild = new Map(alertCounts.map((a) => [a.childId, a._count._all]));

  return parents.map((p) => {
    const trialEnds = new Date(p.createdAt.getTime() + FREE_TRIAL_DAYS * DAY);
    const planExpires = planBy.get(p.id) ?? null;
    const status: MemberStatus = planExpires
      ? planExpires.getTime() > now
        ? "paid"
        : "paid_expired"
      : trialEnds.getTime() > now
        ? "trial"
        : "trial_expired";
    const lastSeen = p.children.reduce<Date | null>((m, c) => (!m || c.updatedAt > m ? c.updatedAt : m), null);
    return {
      parentId: p.id,
      name: p.user.name,
      email: p.user.email,
      phone: p.user.phone,
      createdAt: p.createdAt.toISOString(),
      status,
      trialEndsAt: trialEnds.toISOString(),
      planExpiresAt: planExpires?.toISOString() ?? null,
      totalPaidTl: payBy.get(p.id)?.total ?? 0,
      paymentCount: payBy.get(p.id)?.count ?? 0,
      children: p.children.length,
      lastDeviceSeenAt: lastSeen?.toISOString() ?? null,
      alerts30d: p.children.reduce((sum, c) => sum + (alertsByChild.get(c.id) ?? 0), 0),
    };
  });
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export async function loadDashboard() {
  await ensureAdminTables();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const yearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const since30 = new Date(now.getTime() - 30 * DAY);
  const since1 = new Date(now.getTime() - DAY);

  const [members, revenueRows, expenseRows, recentPayments, expenses, alerts30, highRisk30, analyses30, devicesOnline, downloads30] = await Promise.all([
    loadMembers(),
    db.$queryRawUnsafe<{ month: string; total: number; count: number }[]>(
      `SELECT to_char(created_at, 'YYYY-MM') AS month, COALESCE(SUM(amount_tl),0)::int AS total, COUNT(*) FILTER (WHERE amount_tl > 0)::int AS count
       FROM parent_subscription_ledger WHERE created_at >= $1 GROUP BY 1`,
      yearAgo
    ),
    db.$queryRawUnsafe<{ month: string; total: number }[]>(
      `SELECT to_char(spent_on, 'YYYY-MM') AS month, COALESCE(SUM(amount_tl),0)::float AS total FROM admin_expenses WHERE spent_on >= $1 GROUP BY 1`,
      yearAgo
    ),
    db.$queryRawUnsafe<{ id: string; parent_id: string; amount_tl: number; days: number; reason: string | null; actor: string | null; created_at: Date }[]>(
      `SELECT id, parent_id, amount_tl, days, reason, actor, created_at FROM parent_subscription_ledger ORDER BY created_at DESC LIMIT 25`
    ),
    db.$queryRawUnsafe<{ id: string; spent_on: Date; category: string; description: string | null; amount_tl: number }[]>(
      `SELECT id, spent_on, category, description, amount_tl::float AS amount_tl FROM admin_expenses ORDER BY spent_on DESC, created_at DESC LIMIT 100`
    ),
    db.alert.count({ where: { createdAt: { gte: since30 } } }),
    db.alert.count({ where: { createdAt: { gte: since30 }, riskScore: { gte: 85 } } }),
    db.socialActivity.count({ where: { analyzedAt: { gte: since30 } } }),
    db.childProfile.count({ where: { isActive: true, updatedAt: { gte: since1 } } }),
    db.$queryRawUnsafe<{ app: string; count: number }[]>(`SELECT app, COUNT(*)::int AS count FROM download_events WHERE created_at >= $1 GROUP BY app`, since30).catch(() => []),
  ]);

  const byStatus = (s: MemberStatus) => members.filter((m) => m.status === s).length;
  const revBy = new Map(revenueRows.map((r) => [r.month, r]));
  const expBy = new Map(expenseRows.map((r) => [r.month, r.total]));
  const signupsBy = new Map<string, number>();
  for (const m of members) {
    const k = monthKey(new Date(m.createdAt));
    signupsBy.set(k, (signupsBy.get(k) ?? 0) + 1);
  }

  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const k = monthKey(d);
    const revenue = revBy.get(k)?.total ?? 0;
    const expense = expBy.get(k) ?? 0;
    return { month: k, revenue, expense, net: revenue - expense, payments: revBy.get(k)?.count ?? 0, signups: signupsBy.get(k) ?? 0 };
  });

  const thisMonth = monthly[11];
  const lastMonth = monthly[10];
  const totalRevenue = members.reduce((s, m) => s + m.totalPaidTl, 0);
  const totalExpense = monthly.reduce((s, m) => s + m.expense, 0);
  const everPaid = members.filter((m) => m.paymentCount > 0).length;
  const trialEnded = members.filter((m) => new Date(m.trialEndsAt).getTime() <= now.getTime()).length;
  const emailBy = new Map(members.map((m) => [m.parentId, m]));

  return {
    generatedAt: now.toISOString(),
    priceTl: MONTHLY_PLAN_TL,
    members: {
      total: members.length,
      newThisMonth: members.filter((m) => new Date(m.createdAt) >= monthStart).length,
      newLastMonth: members.filter((m) => new Date(m.createdAt) >= prevMonthStart && new Date(m.createdAt) < monthStart).length,
      trial: byStatus("trial"),
      trialExpired: byStatus("trial_expired"),
      paid: byStatus("paid"),
      paidExpired: byStatus("paid_expired"),
      everPaid,
      conversionRate: trialEnded ? Math.round((everPaid / trialEnded) * 1000) / 10 : 0,
      withChild: members.filter((m) => m.children > 0).length,
    },
    finance: {
      mrr: byStatus("paid") * MONTHLY_PLAN_TL,
      revenueThisMonth: thisMonth.revenue,
      revenueLastMonth: lastMonth.revenue,
      expenseThisMonth: thisMonth.expense,
      netThisMonth: thisMonth.net,
      revenueTotal: totalRevenue,
      expense12m: totalExpense,
      arpu: everPaid ? Math.round(totalRevenue / everPaid) : 0,
      monthly,
    },
    usage: { alerts30, highRisk30, analyses30, devicesOnline, downloads30 },
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      parentId: p.parent_id,
      email: emailBy.get(p.parent_id)?.email ?? "(silinmiş hesap)",
      name: emailBy.get(p.parent_id)?.name ?? null,
      amountTl: p.amount_tl,
      days: p.days,
      method: p.actor === "iyzico" ? "Kart (iyzico)" : p.amount_tl > 0 ? "Havale / manuel" : "Hediye",
      reason: p.reason,
      createdAt: p.created_at.toISOString(),
    })),
    expenses: expenses.map((e) => ({ ...e, spent_on: new Date(e.spent_on).toISOString().slice(0, 10) })),
    trialEndingSoon: members
      .filter((m) => m.status === "trial" && new Date(m.trialEndsAt).getTime() - now.getTime() < 3 * DAY)
      .map((m) => ({ parentId: m.parentId, email: m.email, name: m.name, trialEndsAt: m.trialEndsAt, children: m.children })),
  };
}
