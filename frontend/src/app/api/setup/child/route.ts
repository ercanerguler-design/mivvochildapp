import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  displayName: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deviceId: z.string().max(256).optional(),
});

function isUnder18(birthDate: Date) {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  return beforeBirthday ? age - 1 < 18 : age < 18;
}

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

  const birthDate = new Date(`${parsed.data.birthDate}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime())) {
    return NextResponse.json({ error: "Geçersiz doğum tarihi" }, { status: 400 });
  }

  if (!isUnder18(birthDate)) {
    return NextResponse.json({ error: "Çocuk profili için yaş 18'den küçük olmalıdır" }, { status: 400 });
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
      birthDate,
      deviceId: parsed.data.deviceId ?? null,
      consentAt: new Date(),
    },
  });

  return NextResponse.json({ id: child.id });
}
