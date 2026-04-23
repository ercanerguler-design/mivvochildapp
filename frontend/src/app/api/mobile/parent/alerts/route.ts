import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBearerToken, verifyMobileParentToken } from "@/lib/mobile-parent-auth";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const status = searchParams.get("status") ?? undefined;

  const parent = await db.parentProfile.findUnique({
    where: { id: payload.parentId },
    include: { children: { select: { id: true } } },
  });

  if (!parent) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  const childIds = parent.children.map((c) => c.id);
  const where = {
    childId: { in: childIds },
    ...(status ? { status: status as never } : {}),
  };

  const [alerts, total] = await Promise.all([
    db.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        child: { select: { id: true, displayName: true } },
      },
    }),
    db.alert.count({ where }),
  ]);

  return NextResponse.json({
    alerts,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
