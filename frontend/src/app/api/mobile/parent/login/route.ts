import { NextRequest, NextResponse } from "next/server";
import { TOO_MANY, clientIp, rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signMobileParentToken } from "@/lib/mobile-parent-auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`mobile-login:${clientIp(req.headers)}`, 10, 900)).ok) {
    return NextResponse.json(TOO_MANY, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: { email: { equals: parsed.data.email, mode: "insensitive" } },
    include: {
      parentProfile: true,
    },
  });

  if (!user || !user.password || !user.parentProfile) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signMobileParentToken({
    parentId: user.parentProfile.id,
    userId: user.id,
    role: "PARENT",
  });

  return NextResponse.json({
    token,
    parent: {
      id: user.parentProfile.id,
      name: user.name,
      email: user.email,
      notifyPush: user.parentProfile.notifyPush,
      sensitivityLevel: user.parentProfile.sensitivityLevel,
    },
  });
}
