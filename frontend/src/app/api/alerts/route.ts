import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const pageSize = 20;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: { children: { select: { id: true } } },
  });
  if (!parent) {
    return NextResponse.json(
      { error: "Ebeveyn profili bulunamadı" },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const status = searchParams.get("status") ?? undefined;
  const childId = searchParams.get("childId") ?? undefined;

  const childIds = parent.children.map((c: { id: string }) => c.id);

  const where = {
    childId: childId && childIds.includes(childId) ? childId : { in: childIds },
    ...(status ? { status: status as any } : {}),
  };

  const [alerts, total] = await Promise.all([
    db.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        child: { select: { displayName: true } },
      },
    }),
    db.alert.count({ where }),
  ]);

  return NextResponse.json({
    alerts,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const schema = z.object({
    alertId: z.string().cuid(),
    status: z.enum(["SEEN", "RESOLVED", "DISMISSED"]),
  });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  // Alertin bu ebeveyine ait olduğunu doğrula
  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: { children: { select: { id: true } } },
  });
  if (!parent) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const childIds = parent.children.map((c: { id: string }) => c.id);
  const alert = await db.alert.findFirst({
    where: { id: parsed.data.alertId, childId: { in: childIds } },
  });
  if (!alert) {
    return NextResponse.json({ error: "Alert bulunamadı" }, { status: 404 });
  }

  const updated = await db.alert.update({
    where: { id: alert.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}
