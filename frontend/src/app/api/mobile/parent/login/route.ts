import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signMobileParentToken } from "@/lib/mobile-parent-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
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

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
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
