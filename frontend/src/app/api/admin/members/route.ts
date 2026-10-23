import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { loadMembers, STATUS_LABEL, type MemberStatus } from "@/lib/admin-data";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLocaleLowerCase("tr-TR");
  const status = req.nextUrl.searchParams.get("status") as MemberStatus | null;
  const format = req.nextUrl.searchParams.get("format");

  let members = await loadMembers();
  if (status && status in STATUS_LABEL) members = members.filter((m) => m.status === status);
  if (q) members = members.filter((m) => [m.email, m.name, m.phone, m.parentId].some((v) => v?.toLocaleLowerCase("tr-TR").includes(q)));

  if (format === "csv") {
    const head = ["Ad", "E-posta", "Telefon", "Durum", "Kayıt", "Deneme bitişi", "Abonelik bitişi", "Toplam ödeme (TL)", "Çocuk", "Uyarı (30 gün)"];
    const rows = members.map((m) => [m.name ?? "", m.email ?? "", m.phone ?? "", STATUS_LABEL[m.status], m.createdAt.slice(0, 10), m.trialEndsAt.slice(0, 10), m.planExpiresAt?.slice(0, 10) ?? "", String(m.totalPaidTl), String(m.children), String(m.alerts30d)]);
    const csv = "﻿" + [head, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\r\n");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="mivvo-uyeler-${new Date().toISOString().slice(0, 10)}.csv"` } });
  }

  return NextResponse.json({ members, total: members.length });
}
