import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  fcmToken: z.string().max(512).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  const profile = await db.parentProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      fcmToken: parsed.data.fcmToken ?? null,
      notifyEmail: true,
      notifyPush: true,
      sensitivityLevel: 70,
    },
    update: {
      fcmToken: parsed.data.fcmToken ?? undefined,
    },
  });

  return NextResponse.json({ id: profile.id });
}
