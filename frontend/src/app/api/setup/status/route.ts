import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Which child devices are paired; the setup wizard polls this to detect a new pairing. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      children: {
        where: { isActive: true, deviceId: { not: null } },
        orderBy: { consentAt: "desc" },
        select: { id: true, displayName: true, consentAt: true },
      },
    },
  });

  return NextResponse.json({
    serverTime: new Date().toISOString(),
    // consentAt is refreshed on every (re)pairing, so it marks when a phone was last paired.
    children: (parent?.children ?? []).map((c) => ({ id: c.id, displayName: c.displayName, pairedAt: c.consentAt.toISOString() })),
  });
}
