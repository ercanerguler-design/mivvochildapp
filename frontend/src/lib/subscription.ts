import { db } from "@/lib/db";

export const FREE_TRIAL_ANALYSIS_LIMIT = Number(
  process.env.FREE_TRIAL_ANALYSIS_LIMIT ?? "7"
);

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

  billingTableReady = true;
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
  const used = await db.socialActivity.count({
    where: {
      child: { parentId },
      analyzedAt: { not: null },
    },
  });

  const remaining = Math.max(0, FREE_TRIAL_ANALYSIS_LIMIT - used);

  return {
    limit: FREE_TRIAL_ANALYSIS_LIMIT,
    used,
    remaining,
    exceeded: used >= FREE_TRIAL_ANALYSIS_LIMIT,
  };
}

export async function getParentBillingStatus(parentId: string) {
  const trial = await getParentTrialUsage(parentId);
  const credits = await getParentCreditBalance(parentId);

  return {
    trial,
    credits,
    childAppFree: true,
  };
}

export function calculateBillableUnits(usedBefore: number, analyzeCount: number) {
  const freeRemaining = Math.max(0, FREE_TRIAL_ANALYSIS_LIMIT - usedBefore);
  return Math.max(0, analyzeCount - freeRemaining);
}
