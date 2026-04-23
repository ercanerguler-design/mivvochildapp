import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  displayName: z.string().min(1).max(100),
  deviceId: z.string().max(256).optional(),
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

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!parent) {
    return NextResponse.json({ error: "Önce ebeveyn profili oluşturun" }, { status: 400 });
  }

  const child = await db.childProfile.create({
    data: {
      parentId: parent.id,
      displayName: parsed.data.displayName,
      deviceId: parsed.data.deviceId ?? null,
      consentAt: new Date(),
    },
  });

  return NextResponse.json({ id: child.id });
}
