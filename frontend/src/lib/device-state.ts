import type { DeviceStatus } from "@/lib/device-status";

/**
 * One rule set for "is protection running on the child's phone?", the same as the parent app
 * (parent-app-expo/src/labels.ts). It reads the device status the phone reports (heartbeat,
 * notification access, unpairing), never the profile's last edit time.
 */
export type DeviceState = "unpaired" | "access_off" | "online" | "recent" | "lost";

export function ago(date: Date, now: number) {
  const m = Math.max(0, Math.round((now - date.getTime()) / 60000));
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.round(h / 24)} gün önce`;
}

export function deviceState(status: DeviceStatus | undefined, fallbackLastSeen: Date, now: number) {
  const lastSeen = status?.last_seen_at ?? fallbackLastSeen;
  if (status?.unpaired_at) {
    return { state: "unpaired" as DeviceState, label: `Eşleştirme çocuk tarafından kaldırıldı · ${ago(status.unpaired_at, now)}`, tone: "red" as const, alarm: true };
  }
  if (status?.notification_access === false) {
    return { state: "access_off" as DeviceState, label: "Koruma kapalı · bildirim erişimi kapatıldı", tone: "red" as const, alarm: true };
  }
  const minutes = (now - lastSeen.getTime()) / 60000;
  if (minutes <= 30) return { state: "online" as DeviceState, label: "Koruma açık", tone: "green" as const, alarm: false };
  if (minutes <= 24 * 60) return { state: "recent" as DeviceState, label: `Son görülme ${ago(lastSeen, now)}`, tone: "amber" as const, alarm: false };
  return { state: "lost" as DeviceState, label: "Bağlantı yok · uygulama kaldırılmış olabilir", tone: "red" as const, alarm: true };
}

export const TONE_CLASS = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-rose-50 text-rose-700",
} as const;
