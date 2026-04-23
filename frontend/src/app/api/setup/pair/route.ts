import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPairingCode } from "@/lib/pairing";

const schema = z.object({
  pairCode: z.string().min(8),
  displayName: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deviceId: z.string().max(256).optional(),
  fcmToken: z.string().max(512).optional(),
});

function isUnder18(birthDate: Date) {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  return beforeBirthday ? age - 1 < 18 : age < 18;
}

function isMobileAuthorized(req: NextRequest) {
  const expectedKey = process.env.MOBILE_API_KEY;
  if (!expectedKey) return true;

  const provided = req.headers.get("x-mobile-api-key") ?? "";
  return provided === expectedKey;
}

export async function POST(req: NextRequest) {
  if (!isMobileAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized mobile request" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const birthDate = new Date(`${parsed.data.birthDate}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime())) {
    return NextResponse.json({ error: "Invalid birth date" }, { status: 400 });
  }

  if (!isUnder18(birthDate)) {
    return NextResponse.json({ error: "Child must be under 18" }, { status: 400 });
  }

  const verification = verifyPairingCode(parsed.data.pairCode);
  if (!verification.valid) {
    return NextResponse.json({ error: "Invalid or expired pairing code" }, { status: 400 });
  }

  const parent = await db.parentProfile.findUnique({
    where: { id: verification.parentId },
  });

  if (!parent) {
    return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
  }

  if (parsed.data.deviceId) {
    const existingForDevice = await db.childProfile.findFirst({
      where: {
        parentId: parent.id,
        deviceId: parsed.data.deviceId,
      },
      select: { id: true },
    });

    if (existingForDevice) {
      return NextResponse.json({ childId: existingForDevice.id, parentId: parent.id, alreadyLinked: true });
    }
  }

  const child = await db.childProfile.create({
    data: {
      parentId: parent.id,
      displayName: parsed.data.displayName,
      birthDate,
      deviceId: parsed.data.deviceId ?? null,
      fcmToken: parsed.data.fcmToken ?? null,
      consentAt: new Date(),
      isActive: true,
    },
  });

  return NextResponse.json(
    {
      childId: child.id,
      parentId: parent.id,
      expiresAt: verification.expiresAt,
      alreadyLinked: false,
    },
    { status: 201 }
  );
}
