import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getParentBillingStatus } from "@/lib/subscription";
import { z } from "zod";

const updateSchema = z.object({
  sensitivityLevel: z.number().int().min(0).max(100),
  notifyPush: z.boolean(),
  notifyEmail: z.boolean(),
  fcmToken: z.string().max(512).nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      sensitivityLevel: true,
      notifyPush: true,
      notifyEmail: true,
      fcmToken: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const billing = await getParentBillingStatus(profile.id);

  return NextResponse.json({
    ...profile,
    billing,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await db.parentProfile.update({
    where: { userId: session.user.id },
    data: {
      sensitivityLevel: parsed.data.sensitivityLevel,
      notifyPush: parsed.data.notifyPush,
      notifyEmail: parsed.data.notifyEmail,
      fcmToken: parsed.data.fcmToken,
    },
    select: {
      sensitivityLevel: true,
      notifyPush: true,
      notifyEmail: true,
      fcmToken: true,
    },
  });

  return NextResponse.json(updated);
}
