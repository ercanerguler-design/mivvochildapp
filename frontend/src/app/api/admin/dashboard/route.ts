import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { loadDashboard } from "@/lib/admin-data";
import { listRecentSystemEvents } from "@/lib/system-events";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  const [data, systemEvents] = await Promise.all([loadDashboard(), listRecentSystemEvents(72).catch(() => [])]);
  return NextResponse.json({ ...data, systemEvents });
}
