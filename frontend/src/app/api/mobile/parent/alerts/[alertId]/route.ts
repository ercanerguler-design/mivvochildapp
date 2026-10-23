import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getBearerToken, verifyMobileParentToken } from "@/lib/mobile-parent-auth";

const statusSchema = z.object({
  status: z.enum(["SEEN", "RESOLVED", "DISMISSED"]),
  resolutionNote: z.string().trim().min(2).max(200).optional(),
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
        isActive: true,
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
        isActive: true,
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

  const now = new Date();
  const shouldAttachResolutionNote =
    parsed.data.status === "RESOLVED" && Boolean(parsed.data.resolutionNote);

  const noteLine = shouldAttachResolutionNote
    ? `[RESOLUTION_NOTE|${now.toISOString()}] ${parsed.data.resolutionNote}`
    : null;

  const existingWithContext = await db.alert.findUnique({
    where: { id: alertId },
    select: { context: true },
  });

  const nextContext = noteLine
    ? [existingWithContext?.context, noteLine].filter(Boolean).join("\n")
    : undefined;

  const updated = await db.alert.update({
    where: { id: alertId },
    data: {
      status: parsed.data.status,
      ...(nextContext ? { context: nextContext } : {}),
    },
  });

  return NextResponse.json(updated);
}
