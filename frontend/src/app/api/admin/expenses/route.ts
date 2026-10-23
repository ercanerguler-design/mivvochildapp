import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import { EXPENSE_CATEGORIES, ensureAdminTables } from "@/lib/admin-data";

const schema = z.object({
  spentOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().trim().max(200).optional(),
  amountTl: z.number().positive().max(10_000_000),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tarih, kategori ve tutarı kontrol edin." }, { status: 400 });
  await ensureAdminTables();
  const id = crypto.randomUUID();
  await db.$executeRawUnsafe(
    `INSERT INTO admin_expenses (id, spent_on, category, description, amount_tl) VALUES ($1, $2::date, $3, $4, $5)`,
    id,
    parsed.data.spentOn,
    parsed.data.category,
    parsed.data.description ?? null,
    parsed.data.amountTl
  );
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  await ensureAdminTables();
  await db.$executeRawUnsafe(`DELETE FROM admin_expenses WHERE id = $1`, id);
  return NextResponse.json({ ok: true });
}
