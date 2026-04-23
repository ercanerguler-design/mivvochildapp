import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  childId: z.string().cuid(),
  deviceId: z.string().max(256).optional(),
  fcmToken: z.string().max(512).optional(),
  appVersion: z.string().max(32).optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  osVersion: z.string().max(32).optional(),
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.MOBILE_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { childId, deviceId, fcmToken } = parsed.data;

  const child = await db.childProfile.findUnique({ where: { id: childId } });
  if (!child || !child.isActive) {
    return NextResponse.json({ error: "Child profile not found or inactive" }, { status: 404 });
  }

  await db.childProfile.update({
    where: { id: childId },
    data: {
      deviceId: deviceId ?? undefined,
      fcmToken: fcmToken ?? undefined,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, serverTime: new Date().toISOString() });
}
