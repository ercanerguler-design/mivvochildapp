import { db } from "@/lib/db";

/**
 * Fixed-window rate limiter backed by Postgres (works across serverless instances,
 * no extra service). Fails open on database errors so an outage never locks users out.
 */
let ready = false;

async function ensureTable() {
  if (ready) return;
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      window_start TIMESTAMPTZ NOT NULL
    )
  `);
  ready = true;
}

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  try {
    await ensureTable();
    const rows = await db.$queryRawUnsafe<{ count: number }[]>(
      `INSERT INTO rate_limits (key, count, window_start) VALUES ($1, 1, NOW())
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN rate_limits.window_start < NOW() - ($2 || ' seconds')::interval THEN 1 ELSE rate_limits.count + 1 END,
         window_start = CASE WHEN rate_limits.window_start < NOW() - ($2 || ' seconds')::interval THEN NOW() ELSE rate_limits.window_start END
       RETURNING count`,
      key,
      String(windowSeconds)
    );
    const count = rows[0]?.count ?? 0;
    return { ok: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (e) {
    console.error("[rate-limit] failing open", e);
    return { ok: true, remaining: limit };
  }
}

/** Current count in the window without incrementing it (0 when unknown). */
export async function peekRateLimit(key: string, windowSeconds: number) {
  try {
    await ensureTable();
    const rows = await db.$queryRawUnsafe<{ count: number }[]>(
      `SELECT count FROM rate_limits WHERE key = $1 AND window_start >= NOW() - ($2 || ' seconds')::interval`,
      key,
      String(windowSeconds)
    );
    return rows[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export function clientIp(headers: Headers) {
  return (headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}

export const TOO_MANY = { error: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin." };
