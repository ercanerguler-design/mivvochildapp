import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isChildDeviceAuthorized } from "@/lib/device-token";
import { recordHeartbeat, sweepOfflineDevices } from "@/lib/device-status";

const schema = z.object({
  childId: z.string().cuid(),
  deviceId: z.string().max(256).optional(),
  fcmToken: z.string().max(512).optional(),
  appVersion: z.string().max(32).optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  osVersion: z.string().max(32).optional(),
  // App 2.1+: protection status, and whether this heartbeat comes from the background scheduler.
  notificationAccess: z.boolean().optional(),
  background: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { childId, deviceId, fcmToken } = parsed.data;
  if (!isChildDeviceAuthorized(req, childId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const child = await db.childProfile.findUnique({ where: { id: childId }, select: { id: true, isActive: true, displayName: true, parent: { select: { fcmToken: true } } } });
  if (!child || !child.isActive) {
    return NextResponse.json({ error: "Child profile not found or inactive" }, { status: 404 });
  }

  await db.childProfile.update({
    where: { id: childId },
    data: { deviceId: deviceId ?? undefined, fcmToken: fcmToken ?? undefined, updatedAt: new Date() },
  });

  await recordHeartbeat(child, {
    notificationAccess: parsed.data.notificationAccess,
    background: parsed.data.background,
    appVersion: parsed.data.appVersion,
  });

  // Every heartbeat opportunistically checks for devices that went silent (throttled globally).
  after(() => sweepOfflineDevices().catch((e) => console.error("[sweepOfflineDevices]", e)));

  return NextResponse.json({ ok: true, serverTime: new Date().toISOString() });
}
