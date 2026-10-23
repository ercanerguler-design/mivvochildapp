import { NextResponse, type NextRequest } from "next/server";

/** Tells the root layout which language a URL-localized marketing page is in. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-mivvo-locale", locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/", "/en", "/en/:path*", "/rehber", "/rehber/:path*",
    "/gizlilik", "/kvkk", "/acik-riza", "/kullanim-kosullari", "/on-bilgilendirme",
    "/mesafeli-satis", "/iptal-iade", "/cerez-politikasi", "/guvenlik",
  ],
};
