import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isChildDeviceAuthorized } from "@/lib/device-token";
import { recordUnpair } from "@/lib/device-status";

const schema = z.object({ childId: z.string().cuid() });

/** Called by Mivvo Çocuk right before it removes its pairing, so the parent is told immediately. */
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { childId } = parsed.data;
  if (!isChildDeviceAuthorized(req, childId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const child = await db.childProfile.findUnique({ where: { id: childId }, select: { id: true, isActive: true, displayName: true, parent: { select: { fcmToken: true } } } });
  if (!child || !child.isActive) return NextResponse.json({ ok: true });

  const pushed = await recordUnpair(child);
  return NextResponse.json({ ok: true, parentNotified: pushed });
}
