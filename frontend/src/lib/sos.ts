import crypto from "crypto";
import { db } from "@/lib/db";
import { sendParentPush } from "@/lib/notifications";

/**
 * Emergency help requests sent by the child with the "Yardım" button. Location is captured only
 * at that moment (no tracking) and kept for 30 days (see cron/retention and the privacy policy).
 */
let ready = false;
async function ensureTable() {
  if (ready) return;
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS sos_events (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      accuracy_m DOUBLE PRECISION,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      acknowledged_at TIMESTAMPTZ
    )
  `);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_sos_events_child ON sos_events (child_id, created_at DESC)`);
  ready = true;
}

export type SosEvent = {
  id: string;
  childId: string;
  childName: string;
  latitude: number | null;
  longitude: number | null;
  accuracyM: number | null;
  createdAt: string;
  acknowledgedAt: string | null;
  mapUrl: string | null;
};

export const mapUrl = (lat: number | null, lng: number | null) =>
  lat === null || lng === null ? null : `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lng.toFixed(6)}`;

type ChildRef = { id: string; displayName: string; parent: { fcmToken: string | null } };

export async function createSos(child: ChildRef, loc: { latitude?: number; longitude?: number; accuracy?: number }) {
  await ensureTable();
  const id = crypto.randomUUID();
  const lat = typeof loc.latitude === "number" ? loc.latitude : null;
  const lng = typeof loc.longitude === "number" ? loc.longitude : null;
  await db.$executeRawUnsafe(
    `INSERT INTO sos_events (id, child_id, latitude, longitude, accuracy_m) VALUES ($1, $2, $3, $4, $5)`,
    id,
    child.id,
    lat,
    lng,
    typeof loc.accuracy === "number" ? loc.accuracy : null
  );
  const url = mapUrl(lat, lng);
  const pushed = await sendParentPush(
    child.parent.fcmToken,
    `🆘 ${child.displayName} yardım istiyor`,
    url ? "Acil yardım butonuna basıldı. Konumu görmek için dokunun." : "Acil yardım butonuna basıldı (konum alınamadı). Hemen ulaşmayı deneyin.",
    { type: "sos", sosId: id, childId: child.id, deepLink: "mivvoparent://sos", ...(url ? { mapUrl: url } : {}) }
  );
  return { id, pushed, mapUrl: url };
}

export async function listSos(childIds: string[], sinceHours = 24 * 7): Promise<SosEvent[]> {
  if (childIds.length === 0) return [];
  await ensureTable();
  const rows = await db.$queryRawUnsafe<
    { id: string; child_id: string; display_name: string; latitude: number | null; longitude: number | null; accuracy_m: number | null; created_at: Date; acknowledged_at: Date | null }[]
  >(
    `SELECT s.id, s.child_id, c."displayName" AS display_name, s.latitude, s.longitude, s.accuracy_m, s.created_at, s.acknowledged_at
     FROM sos_events s JOIN "ChildProfile" c ON c.id = s.child_id
     WHERE s.child_id = ANY($1::text[]) AND s.created_at > NOW() - ($2 || ' hours')::interval
     ORDER BY s.created_at DESC LIMIT 20`,
    childIds,
    String(sinceHours)
  );
  return rows.map((r) => ({
    id: r.id,
    childId: r.child_id,
    childName: r.display_name,
    latitude: r.latitude,
    longitude: r.longitude,
    accuracyM: r.accuracy_m,
    createdAt: r.created_at.toISOString(),
    acknowledgedAt: r.acknowledged_at?.toISOString() ?? null,
    mapUrl: mapUrl(r.latitude, r.longitude),
  }));
}

export async function acknowledgeSos(id: string, childIds: string[]) {
  await ensureTable();
  await db.$executeRawUnsafe(`UPDATE sos_events SET acknowledged_at = NOW() WHERE id = $1 AND child_id = ANY($2::text[]) AND acknowledged_at IS NULL`, id, childIds);
}

export async function purgeOldSos(days = 30) {
  await ensureTable();
  return db.$executeRawUnsafe(`DELETE FROM sos_events WHERE created_at < NOW() - ($1 || ' days')::interval`, String(days));
}

export async function deleteSosForChildren(childIds: string[]) {
  if (childIds.length === 0) return;
  await ensureTable();
  await db.$executeRawUnsafe(`DELETE FROM sos_events WHERE child_id = ANY($1::text[])`, childIds);
}
