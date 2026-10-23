import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import { activateParentUnlimitedPlan, MONTHLY_PLAN_TL } from "@/lib/subscription";

const activateSchema = z.object({
  parentId: z.string().cuid(),
  days: z.number().int().min(1).max(365).optional(),
  // Amount actually received; 0 = complimentary (not counted as revenue).
  amountTl: z.number().int().min(0).max(100_000).optional(),
  reason: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const parsed = activateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek", details: parsed.error.flatten() }, { status: 400 });

  const parent = await db.parentProfile.findUnique({ where: { id: parsed.data.parentId }, select: { id: true } });
  if (!parent) return NextResponse.json({ error: "Ebeveyn bulunamadı" }, { status: 404 });

  const amountTl = parsed.data.amountTl ?? MONTHLY_PLAN_TL;
  const days = parsed.data.days ?? 30;
  const unlimited = await activateParentUnlimitedPlan({
    parentId: parent.id,
    days,
    amountTl,
    actor: "admin-panel",
    reason: parsed.data.reason ?? (amountTl > 0 ? `Havale/EFT ödemesi alındı (${amountTl} TL, ${days} gün)` : `Hediye abonelik (${days} gün)`),
  });

  return NextResponse.json({ ok: true, unlimited });
}
