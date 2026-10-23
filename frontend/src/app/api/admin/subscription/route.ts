import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activateParentUnlimitedPlan, MONTHLY_PLAN_TL } from "@/lib/subscription";

function isAdminAuthorized(req: NextRequest) {
  const key = req.headers.get("x-admin-key")?.trim();
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const expected = process.env.ADMIN_PANEL_KEY;
  const normalizedExpected = expected?.trim();

  return Boolean(
    normalizedExpected &&
      ((key && key === normalizedExpected) ||
        (bearer && bearer === normalizedExpected))
  );
}

const activateSchema = z.object({
  parentId: z.string().cuid(),
  days: z.number().int().min(1).max(365).optional(),
  reason: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = activateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Gecersiz istek", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const parent = await db.parentProfile.findUnique({
    where: { id: parsed.data.parentId },
    select: { id: true },
  });

  if (!parent) {
    return NextResponse.json({ error: "Ebeveyn bulunamadi" }, { status: 404 });
  }

  const session = await auth();
  const actor = session?.user?.email ?? "admin-panel";
  const reason = parsed.data.reason ?? `Odeme alindi - ${actor} tarafindan 30 gun sinirsiz plan aktif edildi`;

  const unlimited = await activateParentUnlimitedPlan({
    parentId: parsed.data.parentId,
    days: parsed.data.days,
    reason,
    actor,
    amountTl: MONTHLY_PLAN_TL,
  });

  return NextResponse.json({
    ok: true,
    unlimited,
  });
}