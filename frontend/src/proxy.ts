import { NextResponse, type NextRequest } from "next/server";

/** Tells the root layout which language a URL-localized page is in, and remembers the home-page choice. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-mivvo-locale", locale);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  // The home page URL is the language choice: remember it so the cart, contact and legal pages
  // (which read the cookie) open in the same language.
  if ((pathname === "/" || pathname === "/en") && request.cookies.get("mivvo_locale")?.value !== locale) {
    res.cookies.set("mivvo_locale", locale, { path: "/", maxAge: 31536000, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: [
    // Only pages whose language comes from the URL; every other page follows the cookie.
    "/", "/en", "/en/:path*", "/rehber", "/rehber/:path*",
  ],
};
