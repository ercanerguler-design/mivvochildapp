import { db } from "@/lib/db";

/**
 * Tiny operational log (raw table like the billing tables, no migration needed).
 * Used to surface silent failures such as the AI provider being unavailable.
 */
let ready = false;

async function ensureTable() {
  if (ready) return;
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS system_events (
      kind TEXT PRIMARY KEY,
      last_message TEXT,
      count INTEGER NOT NULL DEFAULT 0,
      first_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  ready = true;
}

export async function recordSystemEvent(kind: string, message: string) {
  try {
    await ensureTable();
    await db.$executeRawUnsafe(
      `INSERT INTO system_events (kind, last_message, count) VALUES ($1, $2, 1)
       ON CONFLICT (kind) DO UPDATE SET last_message = EXCLUDED.last_message, count = system_events.count + 1, last_at = NOW()`,
      kind,
      message.slice(0, 500)
    );
  } catch (e) {
    console.error("[system-events] could not record", kind, e);
  }
}

export async function listRecentSystemEvents(sinceHours = 24) {
  await ensureTable();
  return db.$queryRawUnsafe<{ kind: string; last_message: string; count: number; last_at: Date }[]>(
    `SELECT kind, last_message, count, last_at FROM system_events WHERE last_at > NOW() - ($1 || ' hours')::interval ORDER BY last_at DESC`,
    String(sinceHours)
  );
}
