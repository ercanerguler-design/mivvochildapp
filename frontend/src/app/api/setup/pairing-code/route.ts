import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPairingCode, getPairingTtlMinutes } from "@/lib/pairing";

/** Fresh pairing code for the signed-in parent (web setup wizard). */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const parent = await db.parentProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, notifyEmail: true, notifyPush: true, sensitivityLevel: 70 },
    update: {},
    select: { id: true },
  });

  const ttlMinutes = getPairingTtlMinutes();
  return NextResponse.json({ code: createPairingCode(parent.id), ttlMinutes, expiresAt: Date.now() + ttlMinutes * 60_000 });
}
