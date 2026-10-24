import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { SITE_URL } from "@/lib/site";

/**
 * PNG QR code for Mivvo links only (pairing links, downloads). Restricting the content to our
 * own domain keeps this from being used as a general-purpose QR service.
 */
export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("d") ?? "";
  if (!data.startsWith(`${SITE_URL}/`) || data.length > 400) {
    return NextResponse.json({ error: "Geçersiz içerik" }, { status: 400 });
  }
  const size = Math.min(800, Math.max(160, Number(req.nextUrl.searchParams.get("s") ?? "480")));
  const png = await QRCode.toBuffer(data, { type: "png", width: size, margin: 2, errorCorrectionLevel: "M", color: { dark: "#1E1B4B", light: "#FFFFFF" } });
  return new NextResponse(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
  });
}
