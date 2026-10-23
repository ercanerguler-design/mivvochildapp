import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { sendParentPush } from "@/lib/notifications";
import { TOO_MANY, clientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPairingCode } from "@/lib/pairing";
import { createDeviceToken } from "@/lib/device-token";

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

/** Tells the parent a phone was (re)paired, so a reinstall never goes unnoticed. */
function notifyPaired(token: string | null, name: string) {
  after(() =>
    sendParentPush(token, `📱 ${name} · Telefon bağlandı`, "Mivvo Çocuk bu cihazda ebeveyn hesabınızla eşleşti. Bunu siz yapmadıysanız hemen kontrol edin.", { type: "device_paired", deepLink: "mivvoparent://children" }).catch(() => undefined)
  );
}

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`pair:${clientIp(req.headers)}`, 20, 900)).ok) {
    return NextResponse.json(TOO_MANY, { status: 429 });
  }
  // The signed, short-lived pairing code is the credential here; no shared app key is needed.
  const body = await req.json().catch(() => null);
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
      const reactivated = await db.childProfile.update({
        where: { id: existingForDevice.id },
        data: {
          displayName: parsed.data.displayName,
          birthDate,
          deviceId: parsed.data.deviceId,
          fcmToken: parsed.data.fcmToken ?? undefined,
          isActive: true,
          consentAt: new Date(),
        },
        select: { id: true },
      });

      notifyPaired(parent.fcmToken, parsed.data.displayName);
      return NextResponse.json({ childId: reactivated.id, parentId: parent.id, deviceToken: createDeviceToken(reactivated.id), alreadyLinked: true });
    }
  }

  const existingByIdentity = await db.childProfile.findFirst({
    where: {
      parentId: parent.id,
      displayName: { equals: parsed.data.displayName.trim(), mode: "insensitive" },
      birthDate,
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (existingByIdentity) {
    const reactivated = await db.childProfile.update({
      where: { id: existingByIdentity.id },
      data: {
        deviceId: parsed.data.deviceId ?? undefined,
        fcmToken: parsed.data.fcmToken ?? undefined,
        isActive: true,
        consentAt: new Date(),
      },
      select: { id: true },
    });

    notifyPaired(parent.fcmToken, parsed.data.displayName);
      return NextResponse.json({ childId: reactivated.id, parentId: parent.id, deviceToken: createDeviceToken(reactivated.id), alreadyLinked: true });
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

  notifyPaired(parent.fcmToken, parsed.data.displayName);

  return NextResponse.json(
    {
      childId: child.id,
      parentId: parent.id,
      deviceToken: createDeviceToken(child.id),
      expiresAt: verification.expiresAt,
      alreadyLinked: false,
    },
    { status: 201 }
  );
}
