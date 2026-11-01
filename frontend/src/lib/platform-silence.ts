import { db } from "@/lib/db";
import { sendParentPush } from "@/lib/notifications";

/**
 * Detects a messaging app that suddenly goes quiet on a child's phone while Mivvo itself keeps
 * running. Android does not let us ask whether another app's notifications are switched off,
 * but a busy app (say WhatsApp, 300 messages a day) that sends nothing for 24 hours while the
 * phone is online is a strong sign its notifications were turned off. The parent is told once;
 * the warning clears by itself as soon as messages arrive again.
 */

const SILENCE_HOURS = 24;
const BASELINE_DAYS = 7;
const MIN_DAILY_AVERAGE = 10; // only apps the child really uses
const MIN_ACTIVE_DAYS = 3; // ...on several different days
const SWEEP_EVERY_MS = 15 * 60 * 1000;

export const PLATFORM_LABEL: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  SNAPCHAT: "Snapchat",
  TELEGRAM: "Telegram",
  SMS: "SMS",
  OTHER: "Diğer",
};

/** "WhatsApp'tan", "Instagram'dan", "Snapchat'ten": Turkish ablative suffix per app name. */
export const PLATFORM_FROM: Record<string, string> = {
  WHATSAPP: "WhatsApp'tan",
  INSTAGRAM: "Instagram'dan",
  TIKTOK: "TikTok'tan",
  SNAPCHAT: "Snapchat'ten",
  TELEGRAM: "Telegram'dan",
  SMS: "SMS'ten",
  OTHER: "diğer uygulamalardan",
};

let ready = false;
async function ensureTable() {
  if (ready) return;
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS child_platform_silence (
      child_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (child_id, platform)
    )
  `);
  ready = true;
}

type Row = { child_id: string; platform: string; recent_n: number; base_n: number; base_days: number; display_name: string; token: string | null; flagged: boolean };

let lastSweep = 0;

/** Cheap to call often: runs at most every 15 minutes per server instance. */
export async function sweepSilentPlatforms() {
  const now = Date.now();
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  await ensureTable();

  const rows = await db.$queryRawUnsafe<Row[]>(
    `WITH stats AS (
       SELECT a."childId" AS child_id, a.platform::text AS platform,
              COUNT(*) FILTER (WHERE a."createdAt" >= NOW() - ($1 || ' hours')::interval)::int AS recent_n,
              COUNT(*) FILTER (WHERE a."createdAt" < NOW() - ($1 || ' hours')::interval)::int AS base_n,
              COUNT(DISTINCT date_trunc('day', a."createdAt")) FILTER (WHERE a."createdAt" < NOW() - ($1 || ' hours')::interval)::int AS base_days
         FROM "SocialActivity" a
        WHERE a."createdAt" >= NOW() - ($1 || ' hours')::interval - ($2 || ' days')::interval
        GROUP BY 1, 2
     )
     SELECT s.child_id, s.platform, s.recent_n, s.base_n, s.base_days,
            c."displayName" AS display_name, p."fcmToken" AS token,
            (f.child_id IS NOT NULL) AS flagged
       FROM stats s
       JOIN "ChildProfile" c ON c.id = s.child_id AND c."isActive"
       JOIN "ParentProfile" p ON p.id = c."parentId"
       JOIN child_device_status d ON d.child_id = s.child_id
       LEFT JOIN child_platform_silence f ON f.child_id = s.child_id AND f.platform = s.platform
      WHERE d.unpaired_at IS NULL`,
    String(SILENCE_HOURS),
    String(BASELINE_DAYS)
  );

  // Only phones that are online and have notification access right now: otherwise the
  // offline / access-off warnings already cover it.
  const online = new Set(
    (
      await db.$queryRawUnsafe<{ child_id: string }[]>(
        `SELECT child_id FROM child_device_status WHERE unpaired_at IS NULL AND notification_access IS NOT FALSE AND last_seen_at > NOW() - interval '3 hours'`
      )
    ).map((r) => r.child_id)
  );

  for (const r of rows) {
    if (r.flagged && r.recent_n > 0) {
      await db.$executeRawUnsafe(`DELETE FROM child_platform_silence WHERE child_id = $1 AND platform = $2`, r.child_id, r.platform);
      continue;
    }
    const silent = r.recent_n === 0 && r.base_n / BASELINE_DAYS >= MIN_DAILY_AVERAGE && r.base_days >= MIN_ACTIVE_DAYS;
    if (!silent || r.flagged || !online.has(r.child_id)) continue;

    const inserted = await db.$queryRawUnsafe<{ child_id: string }[]>(
      `INSERT INTO child_platform_silence (child_id, platform) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING child_id`,
      r.child_id,
      r.platform
    );
    if (!inserted.length) continue; // another instance already warned

    const app = PLATFORM_LABEL[r.platform] ?? r.platform;
    const from = PLATFORM_FROM[r.platform] ?? app;
    await sendParentPush(
      r.token,
      `⚠️ ${r.display_name} · ${from} mesaj gelmiyor`,
      `${SILENCE_HOURS} saattir ${from} hiç mesaj gelmedi, oysa normalde günde ortalama ${Math.round(r.base_n / BASELINE_DAYS)} mesaj geliyordu. ${app} bildirimleri kapatılmış olabilir; çocuğunuzla birlikte kontrol edin.`,
      { type: "platform_silent", childId: r.child_id, platform: r.platform, deepLink: "mivvoparent://children" }
    );
  }
}

/** Current "app went quiet" warnings for the parent's dashboard. */
export async function listSilentPlatforms(childIds: string[]) {
  if (childIds.length === 0) return [];
  await ensureTable();
  return db.$queryRawUnsafe<{ child_id: string; platform: string; notified_at: Date }[]>(
    `SELECT child_id, platform, notified_at FROM child_platform_silence WHERE child_id = ANY($1::text[]) ORDER BY notified_at DESC`,
    childIds
  );
}

export async function forgetSilence(childId: string) {
  await ensureTable();
  await db.$executeRawUnsafe(`DELETE FROM child_platform_silence WHERE child_id = $1`, childId);
}
