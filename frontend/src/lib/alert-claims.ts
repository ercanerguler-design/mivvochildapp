import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * The same message often reaches the server twice at the same moment (single + summary
 * notification, handled by two parallel requests). Checking "is there already an alert?" is not
 * enough then: both requests see none. Whoever inserts the claim first creates the alert.
 * Only a one-way hash of the message is stored, never the text.
 */
const WINDOW_MINUTES = 15;

let ready = false;
async function ensureTable() {
  if (ready) return;
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS alert_claims (
      child_id TEXT NOT NULL,
      message_hash TEXT NOT NULL,
      claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (child_id, message_hash)
    )
  `);
  ready = true;
}

/** True only for the first caller for this child + message within the window. */
export async function claimAlert(childId: string, normalizedMessage: string, windowMinutes = WINDOW_MINUTES) {
  await ensureTable();
  const hash = crypto.createHash("sha256").update(normalizedMessage).digest("hex");
  const rows = await db.$queryRawUnsafe<{ ok: number }[]>(
    `INSERT INTO alert_claims (child_id, message_hash) VALUES ($1, $2)
     ON CONFLICT (child_id, message_hash) DO UPDATE SET claimed_at = NOW()
       WHERE alert_claims.claimed_at < NOW() - ($3 || ' minutes')::interval
     RETURNING 1 AS ok`,
    childId,
    hash,
    String(windowMinutes)
  );
  return rows.length > 0;
}

export async function purgeOldClaims() {
  await ensureTable();
  return db.$executeRawUnsafe(`DELETE FROM alert_claims WHERE claimed_at < NOW() - interval '1 day'`);
}
