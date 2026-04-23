import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  addParentCredits,
  getParentBillingStatus,
} from "@/lib/subscription";

function isAdminAuthorized(req: NextRequest) {
  const key = req.headers.get("x-admin-key")?.trim();
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const expected = process.env.ADMIN_PANEL_KEY;
  const normalizedExpected = expected?.trim();

  return Boolean(
    normalizedExpected &&
      ((key && key === normalizedExpected) ||
        (bearer && bearer === normalizedExpected))
  );
}

const parentIdSchema = z.string().cuid();

const addCreditSchema = z.object({
  parentId: z.string().cuid(),
  amount: z.number().int().positive(),
  reason: z.string().max(200).optional(),
});

const completeBirthDateSchema = z.object({
  childId: z.string().cuid(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function isUnder18(birthDate: Date) {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  return beforeBirthday ? age - 1 < 18 : age < 18;
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  const mode = req.nextUrl.searchParams.get("mode");
  if (mode === "missing-birthdate") {
    const children = await db.childProfile.findMany({
      where: { birthDate: null },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        parent: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({
      children: children.map((child) => ({
        id: child.id,
        displayName: child.displayName,
        parentId: child.parentId,
        parentName: child.parent.user?.name ?? null,
        parentEmail: child.parent.user?.email ?? null,
        createdAt: child.createdAt,
      })),
    });
  }

  const parentId = req.nextUrl.searchParams.get("parentId");
  if (!parentId) {
    const parents = await db.parentProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { name: true, email: true } },
        children: { select: { id: true, birthDate: true } },
      },
    });

    return NextResponse.json({
      parents: parents.map((parent) => ({
        id: parent.id,
        name: parent.user?.name ?? null,
        email: parent.user?.email ?? null,
        childCount: parent.children.length,
        missingBirthDateCount: parent.children.filter((child) => !child.birthDate).length,
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

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = completeBirthDateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gecersiz istek", details: parsed.error.flatten() }, { status: 400 });
  }

  const birthDate = new Date(`${parsed.data.birthDate}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime())) {
    return NextResponse.json({ error: "Gecersiz dogum tarihi" }, { status: 400 });
  }

  if (!isUnder18(birthDate)) {
    return NextResponse.json({ error: "Tamamlama icin yas 18'den kucuk olmali" }, { status: 400 });
  }

  const child = await db.childProfile.findUnique({
    where: { id: parsed.data.childId },
    select: { id: true, birthDate: true },
  });

  if (!child) {
    return NextResponse.json({ error: "Cocuk bulunamadi" }, { status: 404 });
  }

  const updated = await db.childProfile.update({
    where: { id: parsed.data.childId },
    data: { birthDate },
    select: {
      id: true,
      displayName: true,
      birthDate: true,
    },
  });

  return NextResponse.json({ ok: true, child: updated });
}
