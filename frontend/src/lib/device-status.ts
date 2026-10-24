import { db } from "@/lib/db";
import { sendParentPush } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Child device health, so parents learn when protection stops:
 * - notification access turned off on the phone (reported by every heartbeat),
 * - no heartbeat for OFFLINE_HOURS (app removed, phone off for long, or background killed).
 * Android does not let an app detect its own uninstall; silence is the only signal.
 *
 * Offline alerts apply only to app versions that send background heartbeats (`background: true`),
 * so older installs that only check in while open never cause false "removed" alerts.
 */
const OFFLINE_HOURS = 12;

let ready = false;
async function ensureTable() {
  if (ready) return;
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS child_device_status (
      child_id TEXT PRIMARY KEY,
      notification_access BOOLEAN,
      background_capable BOOLEAN NOT NULL DEFAULT FALSE,
      app_version TEXT,
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      offline_notified_at TIMESTAMPTZ,
      access_notified_at TIMESTAMPTZ
    )
  `);
  await db.$executeRawUnsafe(`ALTER TABLE child_device_status ADD COLUMN IF NOT EXISTS unpaired_at TIMESTAMPTZ`);
  ready = true;
}

export type DeviceStatus = { child_id: string; notification_access: boolean | null; background_capable: boolean; app_version: string | null; last_seen_at: Date; offline_notified_at: Date | null; unpaired_at: Date | null };

export async function getDeviceStatuses(childIds: string[]) {
  if (childIds.length === 0) return new Map<string, DeviceStatus>();
  await ensureTable();
  const rows = await db.$queryRawUnsafe<DeviceStatus[]>(
    `SELECT child_id, notification_access, background_capable, app_version, last_seen_at, offline_notified_at, unpaired_at FROM child_device_status WHERE child_id = ANY($1::text[])`,
    childIds
  );
  return new Map(rows.map((r) => [r.child_id, r]));
}

type ChildRef = { id: string; displayName: string; parent: { fcmToken: string | null } };

export async function recordHeartbeat(child: ChildRef, info: { notificationAccess?: boolean; background?: boolean; appVersion?: string }) {
  await ensureTable();
  const prev = (
    await db.$queryRawUnsafe<{ notification_access: boolean | null; offline_notified_at: Date | null; access_notified_at: Date | null }[]>(
      `SELECT notification_access, offline_notified_at, access_notified_at FROM child_device_status WHERE child_id = $1`,
      child.id
    )
  )[0];

  const access = typeof info.notificationAccess === "boolean" ? info.notificationAccess : (prev?.notification_access ?? null);
  const accessJustOff = access === false && !prev?.access_notified_at;

  await db.$executeRawUnsafe(
    `INSERT INTO child_device_status (child_id, notification_access, background_capable, app_version, last_seen_at, offline_notified_at, access_notified_at)
     VALUES ($1, $2, $3, $4, NOW(), NULL, $5)
     ON CONFLICT (child_id) DO UPDATE SET
       notification_access = EXCLUDED.notification_access,
       background_capable = child_device_status.background_capable OR EXCLUDED.background_capable,
       app_version = COALESCE(EXCLUDED.app_version, child_device_status.app_version),
       last_seen_at = NOW(),
       offline_notified_at = NULL,
       unpaired_at = NULL,
       access_notified_at = EXCLUDED.access_notified_at`,
    child.id,
    access,
    info.background === true,
    info.appVersion ?? null,
    access === false ? (prev?.access_notified_at ?? new Date()) : null
  );

  const token = child.parent.fcmToken;
  if (accessJustOff) {
    await sendParentPush(token, `⚠️ ${child.displayName} · Koruma kapatıldı`, "Çocuğunuzun telefonunda Mivvo'nun bildirim erişimi kapatıldı. Mesajlar şu an analiz edilmiyor.", { type: "device_access_off", childId: child.id, deepLink: "mivvoparent://children" });
  } else if (prev?.offline_notified_at) {
    await sendParentPush(token, `✅ ${child.displayName} · Yeniden bağlandı`, "Çocuğunuzun telefonundaki Mivvo tekrar çalışıyor.", { type: "device_back", childId: child.id });
  }
}

/** The child removed the pairing on the phone: remember it and tell the parent right away. */
export async function recordUnpair(child: ChildRef) {
  await ensureTable();
  await db.$executeRawUnsafe(
    `INSERT INTO child_device_status (child_id, last_seen_at, unpaired_at) VALUES ($1, NOW(), NOW())
     ON CONFLICT (child_id) DO UPDATE SET unpaired_at = NOW(), background_capable = FALSE`,
    child.id
  );
  return sendParentPush(
    child.parent.fcmToken,
    `🔓 ${child.displayName} · Eşleştirme kaldırıldı`,
    "Mivvo Çocuk uygulamasında eşleştirme kaldırıldı. Bu telefondaki mesajlar artık analiz edilmiyor.",
    { type: "device_unpaired", childId: child.id, deepLink: "mivvoparent://children" }
  );
}

/** Notifies parents about devices that went silent. Throttled to one sweep per 10 minutes across all instances. */
export async function sweepOfflineDevices() {
  if (!(await rateLimit("sweep-offline-devices", 1, 600)).ok) return 0;
  await ensureTable();
  const stale = await db.$queryRawUnsafe<{ child_id: string }[]>(
    `SELECT child_id FROM child_device_status
     WHERE background_capable AND offline_notified_at IS NULL AND unpaired_at IS NULL AND last_seen_at < NOW() - ($1 || ' hours')::interval
     LIMIT 50`,
    String(OFFLINE_HOURS)
  );
  let sent = 0;
  for (const { child_id } of stale) {
    const child = await db.childProfile.findUnique({ where: { id: child_id }, select: { displayName: true, isActive: true, parent: { select: { fcmToken: true } } } });
    await db.$executeRawUnsafe(`UPDATE child_device_status SET offline_notified_at = NOW() WHERE child_id = $1`, child_id);
    if (!child?.isActive) continue;
    const ok = await sendParentPush(
      child.parent.fcmToken,
      `📵 ${child.displayName} · Bağlantı yok`,
      `Çocuğunuzun telefonundaki Mivvo ${OFFLINE_HOURS} saattir bağlanmıyor. Uygulama kaldırılmış, telefon uzun süredir kapalı veya internet bağlantısı yok olabilir.`,
      { type: "device_offline", childId: child_id, deepLink: "mivvoparent://children" }
    );
    if (ok) sent++;
  }
  return sent;
}

export async function forgetDevice(childId: string) {
  await ensureTable();
  await db.$executeRawUnsafe(`DELETE FROM child_device_status WHERE child_id = $1`, childId);
}
