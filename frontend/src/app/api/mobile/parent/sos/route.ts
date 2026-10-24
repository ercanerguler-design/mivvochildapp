import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireMobileParent } from "@/lib/mobile-parent-request";
import { acknowledgeSos, listSos } from "@/lib/sos";

async function childIdsFor(parentId: string) {
  const kids = await db.childProfile.findMany({ where: { parentId, isActive: true }, select: { id: true } });
  return kids.map((k) => k.id);
}

/** Recent help requests for the parent app (last 7 days). */
export async function GET(req: NextRequest) {
  const auth = requireMobileParent(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ events: await listSos(await childIdsFor(auth.parentId)) });
}

/** Marks a help request as seen. */
export async function PATCH(req: NextRequest) {
  const auth = requireMobileParent(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  await acknowledgeSos(parsed.data.id, await childIdsFor(auth.parentId));
  return NextResponse.json({ ok: true });
}
