import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getBearerToken, verifyMobileParentToken } from "@/lib/mobile-parent-auth";

const schema = z.object({
  fcmToken: z.string().min(20).max(512),
});

export async function POST(req: NextRequest) {
  const token = getBearerToken(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = verifyMobileParentToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  await db.parentProfile.update({
    where: { id: payload.parentId },
    data: {
      fcmToken: parsed.data.fcmToken,
      notifyPush: true,
    },
  });

  return NextResponse.json({ ok: true });
}
