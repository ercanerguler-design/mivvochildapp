import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * Card payments ledger (same raw-table approach as subscription.ts, so no Prisma migration is needed).
 * status: pending -> paid | failed | review
 */

let ready = false;

async function ensurePaymentsTable() {
  if (ready) return;
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS parent_payments (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'iyzico',
      conversation_id TEXT NOT NULL UNIQUE,
      token TEXT UNIQUE,
      amount_tl INTEGER NOT NULL,
      days INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      provider_payment_id TEXT,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_parent_payments_parent ON parent_payments (parent_id, created_at DESC)");
  ready = true;
}

export type PaymentRow = {
  id: string;
  parent_id: string;
  conversation_id: string;
  token: string | null;
  amount_tl: number;
  days: number;
  status: string;
};

export async function createPendingPayment(params: { parentId: string; amountTl: number; days: number }) {
  await ensurePaymentsTable();
  const id = crypto.randomUUID();
  const conversationId = `mivvo-${id}`;
  await db.$executeRawUnsafe(
    `INSERT INTO parent_payments (id, parent_id, conversation_id, amount_tl, days) VALUES ($1, $2, $3, $4, $5)`,
    id,
    params.parentId,
    conversationId,
    params.amountTl,
    params.days
  );
  return { id, conversationId };
}

export async function attachToken(id: string, token: string) {
  await ensurePaymentsTable();
  await db.$executeRawUnsafe(`UPDATE parent_payments SET token = $2, updated_at = NOW() WHERE id = $1`, id, token);
}

export async function findPaymentByToken(token: string) {
  await ensurePaymentsTable();
  const rows = await db.$queryRawUnsafe<PaymentRow[]>(
    `SELECT id, parent_id, conversation_id, token, amount_tl, days, status FROM parent_payments WHERE token = $1 LIMIT 1`,
    token
  );
  return rows[0] ?? null;
}

/**
 * Moves a payment to a final state exactly once. Returns true only for the call that made the
 * transition, so the subscription is never extended twice for the same payment.
 */
export async function settlePayment(id: string, status: "paid" | "failed" | "review", info: { providerPaymentId?: string; error?: string }) {
  await ensurePaymentsTable();
  const rows = await db.$queryRawUnsafe<{ id: string }[]>(
    `UPDATE parent_payments
       SET status = $2, provider_payment_id = COALESCE($3, provider_payment_id), error = $4, updated_at = NOW()
     WHERE id = $1 AND status IN ('pending', 'review')
     RETURNING id`,
    id,
    status,
    info.providerPaymentId ?? null,
    info.error ?? null
  );
  return rows.length > 0;
}

export async function listParentPayments(parentId: string, limit = 10) {
  await ensurePaymentsTable();
  return db.$queryRawUnsafe<{ amount_tl: number; days: number; status: string; created_at: Date }[]>(
    `SELECT amount_tl, days, status, created_at FROM parent_payments WHERE parent_id = $1 AND status <> 'pending' ORDER BY created_at DESC LIMIT $2`,
    parentId,
    limit
  );
}
