import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  addParentCredits,
  getParentBillingStatus,
} from "@/lib/subscription";

function isAdminAuthorized(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  const expected = process.env.ADMIN_PANEL_KEY;
  return Boolean(expected && key && key === expected);
}

const parentIdSchema = z.string().cuid();

const addCreditSchema = z.object({
  parentId: z.string().cuid(),
  amount: z.number().int().positive(),
  reason: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  const parentId = req.nextUrl.searchParams.get("parentId");
  if (!parentId) {
    const parents = await db.parentProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { name: true, email: true } },
        children: { select: { id: true } },
      },
    });

    return NextResponse.json({
      parents: parents.map((parent) => ({
        id: parent.id,
        name: parent.user?.name ?? null,
        email: parent.user?.email ?? null,
        childCount: parent.children.length,
      })),
    });
  }

  const parsed = parentIdSchema.safeParse(parentId);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gecersiz parentId" }, { status: 400 });
  }

  const profile = await db.parentProfile.findUnique({
    where: { id: parsed.data },
    include: {
      user: { select: { id: true, name: true, email: true } },
      children: { select: { id: true } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Ebeveyn bulunamadi" }, { status: 404 });
  }

  const billing = await getParentBillingStatus(profile.id);

  return NextResponse.json({
    parent: {
      id: profile.id,
      name: profile.user?.name,
      email: profile.user?.email,
      childCount: profile.children.length,
    },
    billing,
  });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = addCreditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gecersiz istek", details: parsed.error.flatten() }, { status: 400 });
  }

  const session = await auth();
  const actor = session?.user?.email ?? "admin-panel";

  const parent = await db.parentProfile.findUnique({
    where: { id: parsed.data.parentId },
    select: { id: true },
  });

  if (!parent) {
    return NextResponse.json({ error: "Ebeveyn bulunamadi" }, { status: 404 });
  }

  const balance = await addParentCredits({
    parentId: parsed.data.parentId,
    amount: parsed.data.amount,
    reason: parsed.data.reason ?? "Admin tarafindan kredi yuklendi",
    actor,
  });

  const billing = await getParentBillingStatus(parsed.data.parentId);

  return NextResponse.json({
    ok: true,
    balance,
    billing,
  });
}
