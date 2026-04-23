import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getBearerToken, verifyMobileParentToken } from "@/lib/mobile-parent-auth";

const statusSchema = z.object({
  status: z.enum(["SEEN", "RESOLVED", "DISMISSED"]),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  const token = getBearerToken(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = verifyMobileParentToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { alertId } = await params;

  const alert = await db.alert.findFirst({
    where: {
      id: alertId,
      child: {
        parentId: payload.parentId,
      },
    },
    include: {
      child: { select: { id: true, displayName: true } },
    },
  });

  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  return NextResponse.json(alert);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  const token = getBearerToken(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = verifyMobileParentToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { alertId } = await params;

  const existing = await db.alert.findFirst({
    where: {
      id: alertId,
      child: {
        parentId: payload.parentId,
      },
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await db.alert.update({
    where: { id: alertId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}
