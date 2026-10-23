import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    childId: string;
  }>;
};

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { childId } = await params;

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!parent) {
    return NextResponse.json({ error: "Ebeveyn profili bulunamadi" }, { status: 404 });
  }

  const child = await db.childProfile.findFirst({
    where: {
      id: childId,
      parentId: parent.id,
      isActive: true,
    },
    select: { id: true },
  });

  if (!child) {
    return NextResponse.json({ error: "Cocuk bulunamadi" }, { status: 404 });
  }

  await db.childProfile.update({
    where: { id: child.id },
    data: {
      isActive: false,
    },
  });

  return NextResponse.json({ ok: true });
}
