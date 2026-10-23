import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forgetDevice } from "@/lib/device-status";

/**
 * KVKK right to erasure: deletes the account and, through cascades, every child profile,
 * alert, activity and contact. Payment ledgers are kept (legal retention) and consent
 * records are kept as proof; neither contains message content.
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (body?.confirm !== "SİL") return NextResponse.json({ error: "Onaylamak için kutuya SİL yazın." }, { status: 400 });

  const userId = session.user.id;
  const parent = await db.parentProfile.findUnique({ where: { userId }, select: { id: true } });

  const request = await db.dataDeletionRequest.create({ data: { userId } });

  if (parent) {
    const kids = await db.childProfile.findMany({ where: { parentId: parent.id }, select: { id: true } });
    for (const k of kids) await forgetDevice(k.id).catch(() => undefined);
    // Non-financial billing state tied to the parent (credits, active plan).
    for (const table of ["parent_credits", "parent_unlimited_plans"]) {
      await db.$executeRawUnsafe(`DELETE FROM ${table} WHERE parent_id = $1`, parent.id).catch(() => undefined);
    }
  }

  await db.user.delete({ where: { id: userId } });
  await db.dataDeletionRequest.update({ where: { id: request.id }, data: { status: "DONE", processedAt: new Date() } });

  return NextResponse.json({ ok: true });
}
