import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type AppKey = "child" | "parent";

let downloadEventsTableReady = false;

const APK_CONFIG: Record<
  AppKey,
  { envPath: string; defaultPath: string; downloadName: string }
> = {
  child: {
    envPath: "CHILD_APK_FILE_PATH",
    defaultPath: "public/apk/mivvo-child-latest.apk",
    downloadName: "mivvo-child-latest.apk",
  },
  parent: {
    envPath: "PARENT_APK_FILE_PATH",
    defaultPath: "public/apk/mivvo-parent-latest.apk",
    downloadName: "mivvo-parent-latest.apk",
  },
};

function resolveApkPath(app: AppKey) {
  const conf = APK_CONFIG[app];
  const fromEnv = process.env[conf.envPath];
  return path.join(process.cwd(), fromEnv || conf.defaultPath);
}

async function ensureDownloadEventsTable() {
  if (downloadEventsTableReady) return;

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS download_events (
      id TEXT PRIMARY KEY,
      app TEXT NOT NULL,
      user_agent TEXT,
      ip TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS idx_download_events_app_created_at ON download_events (app, created_at DESC)"
  );

  downloadEventsTableReady = true;
}

async function trackDownloadEvent(request: Request, app: AppKey) {
  try {
    await ensureDownloadEventsTable();

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0]?.trim() : null;
    const userAgent = request.headers.get("user-agent");

    await db.$executeRawUnsafe(
      `
      INSERT INTO download_events (id, app, user_agent, ip)
      VALUES ($1, $2, $3, $4)
      `,
      crypto.randomUUID(),
      app,
      userAgent,
      ip
    );
  } catch {
    // Never block APK delivery due to analytics logging issues.
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ app: string }> }
) {
  const { app } = await context.params;

  if (app !== "child" && app !== "parent") {
    return NextResponse.json({ error: "Unknown app type." }, { status: 404 });
  }

  const conf = APK_CONFIG[app];
  const apkPath = resolveApkPath(app);

  try {
    const fileBuffer = await fs.readFile(apkPath);
    await trackDownloadEvent(request, app);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${conf.downloadName}"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error:
          "APK file not found on server. Upload the latest APK files under public/apk or set CHILD_APK_FILE_PATH / PARENT_APK_FILE_PATH.",
        details: message,
      },
      { status: 404 }
    );
  }
}
