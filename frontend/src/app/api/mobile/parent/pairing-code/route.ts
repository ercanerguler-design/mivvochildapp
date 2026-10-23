import { NextRequest, NextResponse } from "next/server";
import { requireMobileParent } from "@/lib/mobile-parent-request";
import { createPairingCode, getPairingTtlMinutes } from "@/lib/pairing";

/** Lets the parent app show a pairing code for the child's phone (same code as the web dashboard). */
export async function POST(req: NextRequest) {
  const auth = requireMobileParent(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    code: createPairingCode(auth.parentId),
    ttlMinutes: getPairingTtlMinutes(),
  });
}
