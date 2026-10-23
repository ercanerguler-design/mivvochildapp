import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listRecentSystemEvents } from "@/lib/system-events";

let adminAnalyticsTablesReady = false;

function isAdminAuthorized(req: NextRequest) {
  const key = req.headers.get("x-admin-key")?.trim();
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const expected = process.env.ADMIN_PANEL_KEY;
  const normalizedExpected = expected?.trim();

  return Boolean(
    normalizedExpected &&
      ((key && key === normalizedExpected) ||
        (bearer && bearer === normalizedExpected))
  );
}

async function ensureAdminAnalyticsTables() {
  if (adminAnalyticsTablesReady) return;

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS download_events (
      id TEXT PRIMARY KEY,
      app TEXT NOT NULL,
      user_agent TEXT,
      ip TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS idx_download_events_app_created_at ON download_events (app, created_at DESC)"
  );

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS parent_credits (
      parent_id TEXT PRIMARY KEY,
      credits INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS parent_credit_ledger (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      reason TEXT,
      actor TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS parent_subscription_ledger (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      days INTEGER NOT NULL,
      amount_tl INTEGER NOT NULL,
      reason TEXT,
      actor TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS idx_parent_subscription_ledger_created_at ON parent_subscription_ledger (created_at DESC)"
  );

  adminAnalyticsTablesReady = true;
}

type DownloadRow = {
  total: number;
  child_total: number;
  parent_total: number;
  last_30_days_total: number;
};

type BillingRow = {
  total_added: number;
  total_spent: number;
  add_tx_count: number;
  add_30_days: number;
};

type SubscriptionRevenueRow = {
  total_tl: number;
  this_month_tl: number;
  paid_mark_count: number;
  distinct_paid_parent_count: number;
};

type SubscriptionRevenueMonthlyRow = {
  month: string;
  paid_count: number;
  total_tl: number;
};

type CreditRow = {
  credits: number;
};

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  await ensureAdminAnalyticsTables();

  const [
    totalUsers,
    totalParents,
    totalChildren,
    totalAlerts,
    highRiskAlerts,
    pendingAlerts,
    totalAnalyses,
    analysesLast30Days,
    recentUsers,
    topParentsRaw,
  ] = await Promise.all([
    db.user.count(),
    db.parentProfile.count(),
    db.childProfile.count(),
    db.alert.count(),
    db.alert.count({ where: { riskScore: { gte: 85 } } }),
    db.alert.count({ where: { status: "PENDING" } }),
    db.socialActivity.count({ where: { analyzedAt: { not: null } } }),
    db.socialActivity.count({
      where: {
        analyzedAt: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    db.user.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        parentProfile: {
          select: {
            id: true,
            _count: {
              select: { children: true },
            },
          },
        },
        childProfile: {
          select: {
            id: true,
            displayName: true,
            parentId: true,
            isActive: true,
          },
        },
      },
    }),
    db.parentProfile.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        children: {
          select: {
            id: true,
            birthDate: true,
            isActive: true,
          },
        },
      },
    }),
  ]);

  const downloadRows = await db.$queryRawUnsafe<DownloadRow[]>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE app = 'child')::int AS child_total,
      COUNT(*) FILTER (WHERE app = 'parent')::int AS parent_total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last_30_days_total
    FROM download_events
  `);

  const billingRows = await db.$queryRawUnsafe<BillingRow[]>(`
    SELECT
      COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)::int AS total_added,
      COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0)::int AS total_spent,
      COUNT(*) FILTER (WHERE amount > 0)::int AS add_tx_count,
      COALESCE(
        SUM(
          CASE
            WHEN amount > 0 AND created_at >= NOW() - INTERVAL '30 days' THEN amount
            ELSE 0
          END
        ),
        0
      )::int AS add_30_days
    FROM parent_credit_ledger
  `);

  const subscriptionRevenueRows = await db.$queryRawUnsafe<SubscriptionRevenueRow[]>(`
    SELECT
      COALESCE(SUM(amount_tl), 0)::int AS total_tl,
      COALESCE(
        SUM(
          CASE
            WHEN date_trunc('month', created_at) = date_trunc('month', NOW()) THEN amount_tl
            ELSE 0
          END
        ),
        0
      )::int AS this_month_tl,
      COUNT(*)::int AS paid_mark_count,
      COUNT(DISTINCT parent_id)::int AS distinct_paid_parent_count
    FROM parent_subscription_ledger
  `);

  const subscriptionRevenueMonthlyRows = await db.$queryRawUnsafe<SubscriptionRevenueMonthlyRow[]>(`
    SELECT
      to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
      COUNT(*)::int AS paid_count,
      COALESCE(SUM(amount_tl), 0)::int AS total_tl
    FROM parent_subscription_ledger
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 12
  `);

  const topParents = await Promise.all(
    topParentsRaw.map(async (parent) => {
      const credits = await db.$queryRawUnsafe<CreditRow[]>(
        "SELECT credits::int FROM parent_credits WHERE parent_id = $1 LIMIT 1",
        parent.id
      );

      const childCount = parent.children.length;
      const activeChildCount = parent.children.filter((child) => child.isActive).length;
      const missingBirthDateCount = parent.children.filter((child) => !child.birthDate).length;

      return {
        id: parent.id,
        name: parent.user?.name ?? null,
        email: parent.user?.email ?? null,
        childCount,
        activeChildCount,
        missingBirthDateCount,
        credits: credits[0]?.credits ?? 0,
        createdAt: parent.createdAt,
      };
    })
  );

  const downloads = downloadRows[0] ?? {
    total: 0,
    child_total: 0,
    parent_total: 0,
    last_30_days_total: 0,
  };

  const billing = billingRows[0] ?? {
    total_added: 0,
    total_spent: 0,
    add_tx_count: 0,
    add_30_days: 0,
  };

  const subscriptionRevenue = subscriptionRevenueRows[0] ?? {
    total_tl: 0,
    this_month_tl: 0,
    paid_mark_count: 0,
    distinct_paid_parent_count: 0,
  };

  const systemEvents = await listRecentSystemEvents(24).catch(() => []);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    systemEvents,
    summary: {
      totalUsers,
      totalParents,
      totalChildren,
      totalAlerts,
      highRiskAlerts,
      pendingAlerts,
      totalAnalyses,
      analysesLast30Days,
    },
    downloads: {
      total: downloads.total,
      child: downloads.child_total,
      parent: downloads.parent_total,
      last30Days: downloads.last_30_days_total,
    },
    billing: {
      totalLoadedCredits: billing.total_added,
      totalConsumedCredits: billing.total_spent,
      loadTransactionCount: billing.add_tx_count,
      loadedCreditsLast30Days: billing.add_30_days,
      totalReceivedTl: subscriptionRevenue.total_tl,
      thisMonthReceivedTl: subscriptionRevenue.this_month_tl,
      paidMarkCount: subscriptionRevenue.paid_mark_count,
      convertedParentCount: subscriptionRevenue.distinct_paid_parent_count,
      monthlyRevenue: subscriptionRevenueMonthlyRows,
    },
    members: {
      recentUsers: recentUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        parentProfileId: user.parentProfile?.id ?? null,
        childCount: user.parentProfile?._count.children ?? 0,
        childProfileId: user.childProfile?.id ?? null,
        childDisplayName: user.childProfile?.displayName ?? null,
        childIsActive: user.childProfile?.isActive ?? null,
      })),
      topParents,
    },
  });
}