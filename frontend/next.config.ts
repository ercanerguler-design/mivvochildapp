import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self), interest-cohort=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    // PayTR opens the payment result page inside its iframe (which sits inside our /dashboard/odeme page),
    // so that one page may be framed by us and by PayTR. Every other page can never be framed.
    const framedByPaytr = securityHeaders
      .filter((h) => h.key !== "X-Frame-Options")
      .map((h) => (h.key === "Content-Security-Policy" ? { ...h, value: "frame-ancestors 'self' https://www.paytr.com; base-uri 'self'; object-src 'none'" } : h));
    return [
      { source: "/((?!odeme/sonuc).*)", headers: securityHeaders },
      { source: "/odeme/sonuc", headers: framedByPaytr },
    ];
  },
};

export default nextConfig;
