import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isChildDeviceAuthorized } from "@/lib/device-token";
import { rateLimit } from "@/lib/rate-limit";
import { createSos } from "@/lib/sos";

const schema = z.object({
  childId: z.string().cuid(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().min(0).max(100_000).optional(),
});

/** "Yardım" button on Mivvo Çocuk: stores the moment's location and alerts the parent at once. */
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { childId, ...loc } = parsed.data;
  if (!isChildDeviceAuthorized(req, childId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Generous limit: a frightened child may press repeatedly, but this stops accidental floods.
  if (!(await rateLimit(`sos:${childId}`, 10, 600)).ok) return NextResponse.json({ ok: true, throttled: true });

  const child = await db.childProfile.findUnique({ where: { id: childId }, select: { id: true, isActive: true, displayName: true, parent: { select: { fcmToken: true } } } });
  if (!child || !child.isActive) return NextResponse.json({ error: "Child profile not found or inactive" }, { status: 404 });

  const result = await createSos(child, loc);
  return NextResponse.json({ ok: true, id: result.id, parentNotified: result.pushed });
}
