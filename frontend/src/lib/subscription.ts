import { db } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;

export const FREE_TRIAL_DAYS = Number(process.env.FREE_TRIAL_DAYS ?? "14");
export const PAID_UNLIMITED_DAYS = Number(process.env.PAID_UNLIMITED_DAYS ?? "30");
export const MONTHLY_PLAN_TL = Number(process.env.MONTHLY_PLAN_TL ?? "299");

let billingTableReady = false;

async function ensureBillingTables() {
  if (billingTableReady) return;

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
    CREATE TABLE IF NOT EXISTS parent_unlimited_plans (
      parent_id TEXT PRIMARY KEY,
      starts_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      reason TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS idx_parent_unlimited_plans_expires_at ON parent_unlimited_plans (expires_at DESC)"
  );

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

  billingTableReady = true;
}

type UnlimitedPlanRow = {
  starts_at: Date;
  expires_at: Date;
};

async function getParentUnlimitedStatus(parentId: string) {
  await ensureBillingTables();

  const rows = await db.$queryRawUnsafe<UnlimitedPlanRow[]>(
    `
    SELECT starts_at, expires_at
    FROM parent_unlimited_plans
    WHERE parent_id = $1
    LIMIT 1
    `,
    parentId
  );

  const plan = rows[0];
  if (!plan) {
    return {
      active: false,
      startAt: null,
      expiresAt: null,
      daysRemaining: 0,
    };
  }

  const now = new Date();
  const remainingMs = plan.expires_at.getTime() - now.getTime();
  const active = remainingMs > 0;

  return {
    active,
    startAt: plan.starts_at,
    expiresAt: plan.expires_at,
    daysRemaining: active ? Math.ceil(remainingMs / DAY_MS) : 0,
  };
}

export async function activateParentUnlimitedPlan(params: {
  parentId: string;
  days?: number;
  reason?: string;
  actor?: string;
  amountTl?: number;
}) {
  const { parentId, reason, actor } = params;
  const days = Math.max(1, Math.floor(params.days ?? PAID_UNLIMITED_DAYS));
  const amountTl = Math.max(0, Math.floor(params.amountTl ?? MONTHLY_PLAN_TL));

  await ensureBillingTables();

  const current = await db.$queryRawUnsafe<UnlimitedPlanRow[]>(
    `
    SELECT starts_at, expires_at
    FROM parent_unlimited_plans
    WHERE parent_id = $1
    LIMIT 1
    `,
    parentId
  );

  const now = new Date();
  const currentExpiresAt = current[0]?.expires_at;
  const startAt = currentExpiresAt && currentExpiresAt > now ? currentExpiresAt : now;
  const expiresAt = new Date(startAt.getTime() + days * DAY_MS);

  await db.$executeRawUnsafe(
    `
    INSERT INTO parent_unlimited_plans (parent_id, starts_at, expires_at, reason, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (parent_id)
    DO UPDATE SET
      starts_at = EXCLUDED.starts_at,
      expires_at = EXCLUDED.expires_at,
      reason = EXCLUDED.reason,
      updated_at = NOW()
    `,
    parentId,
    startAt,
    expiresAt,
    reason ?? `${days} gunluk sinirsiz plan`
  );

  await db.$executeRawUnsafe(
    `
    INSERT INTO parent_subscription_ledger (id, parent_id, days, amount_tl, reason, actor)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    crypto.randomUUID(),
    parentId,
    days,
    amountTl,
    reason ?? `${days} gunluk sinirsiz plan`,
    actor ?? "admin-panel"
  );

  return getParentUnlimitedStatus(parentId);
}

async function ensureParentCreditRow(parentId: string) {
  await ensureBillingTables();
  await db.$executeRawUnsafe(
    `
    INSERT INTO parent_credits (parent_id, credits)
    VALUES ($1, 0)
    ON CONFLICT (parent_id) DO NOTHING
    `,
    parentId
  );
}

export async function getParentCreditBalance(parentId: string): Promise<number> {
  await ensureParentCreditRow(parentId);

  const rows = await db.$queryRawUnsafe<Array<{ credits: number }>>(
    `SELECT credits FROM parent_credits WHERE parent_id = $1 LIMIT 1`,
    parentId
  );

  return rows[0]?.credits ?? 0;
}

export async function addParentCredits(params: {
  parentId: string;
  amount: number;
  reason?: string;
  actor?: string;
}) {
  const { parentId, amount, reason, actor } = params;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("amount must be a positive number");
  }

  await ensureParentCreditRow(parentId);

  await db.$executeRawUnsafe(
    `
    UPDATE parent_credits
    SET credits = credits + $2, updated_at = NOW()
    WHERE parent_id = $1
    `,
    parentId,
    Math.floor(amount)
  );

  await db.$executeRawUnsafe(
    `
    INSERT INTO parent_credit_ledger (id, parent_id, amount, reason, actor)
    VALUES ($1, $2, $3, $4, $5)
    `,
    crypto.randomUUID(),
    parentId,
    Math.floor(amount),
    reason ?? "Admin credit",
    actor ?? "system"
  );

  return getParentCreditBalance(parentId);
}

export async function consumeParentCredits(params: {
  parentId: string;
  amount: number;
  reason?: string;
}) {
  const { parentId, amount, reason } = params;
  const units = Math.max(0, Math.floor(amount));
  if (units === 0) return getParentCreditBalance(parentId);

  await ensureParentCreditRow(parentId);
  const current = await getParentCreditBalance(parentId);
  if (current < units) {
    throw new Error("insufficient_credits");
  }

  await db.$executeRawUnsafe(
    `
    UPDATE parent_credits
    SET credits = credits - $2, updated_at = NOW()
    WHERE parent_id = $1
    `,
    parentId,
    units
  );

  await db.$executeRawUnsafe(
    `
    INSERT INTO parent_credit_ledger (id, parent_id, amount, reason, actor)
    VALUES ($1, $2, $3, $4, $5)
    `,
    crypto.randomUUID(),
    parentId,
    -units,
    reason ?? "Analysis quota usage",
    "system"
  );

  return getParentCreditBalance(parentId);
}

export async function getParentTrialUsage(parentId: string) {
  const [parent, used] = await Promise.all([
    db.parentProfile.findUnique({
      where: { id: parentId },
      select: { createdAt: true },
    }),
    db.socialActivity.count({
      where: {
        child: { parentId },
        analyzedAt: { not: null },
      },
    }),
  ]);

  const trialStartAt = parent?.createdAt ?? new Date();
  const trialExpiresAt = new Date(trialStartAt.getTime() + FREE_TRIAL_DAYS * DAY_MS);
  const now = new Date();
  const remainingMs = trialExpiresAt.getTime() - now.getTime();
  const active = remainingMs > 0;
  const daysRemaining = active ? Math.ceil(remainingMs / DAY_MS) : 0;

  return {
    // Backward-compatible keys used by existing UI.
    limit: FREE_TRIAL_DAYS,
    used,
    remaining: daysRemaining,
    exceeded: !active,

    // New trial metadata for day-based UX.
    mode: "DAYS" as const,
    daysTotal: FREE_TRIAL_DAYS,
    daysRemaining,
    active,
    startAt: trialStartAt,
    expiresAt: trialExpiresAt,
  };
}

export async function getParentBillingStatus(parentId: string) {
  const [trial, credits, unlimited] = await Promise.all([
    getParentTrialUsage(parentId),
    getParentCreditBalance(parentId),
    getParentUnlimitedStatus(parentId),
  ]);

  return {
    trial,
    credits,
    unlimited,
    isUnlimitedActive: unlimited.active,
    childAppFree: true,
  };
}

export function calculateBillableUnits(
  access: {
    trialActive: boolean;
    unlimitedActive: boolean;
  },
  analyzeCount: number
) {
  if (access.trialActive || access.unlimitedActive) return 0;
  return Math.max(0, analyzeCount);
}
