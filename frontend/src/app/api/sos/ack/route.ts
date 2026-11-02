import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { acknowledgeSos } from "@/lib/sos";

/** Web panel: marks a help request as handled (same record the parent app updates). */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const kids = await db.childProfile.findMany({ where: { parent: { userId: session.user.id } }, select: { id: true } });
  await acknowledgeSos(parsed.data.id, kids.map((k) => k.id));
  return NextResponse.json({ ok: true });
}
