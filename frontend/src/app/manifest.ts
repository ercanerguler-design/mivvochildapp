import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mivvo — Ebeveyn Paneli",
    short_name: "Mivvo",
    description: "Yapay zeka destekli ebeveyn kontrol ve çocuk güvenliği uygulaması.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4F46E5",
    lang: "tr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    related_applications: [
      { platform: "play", id: "org.mivvo.parent", url: "https://play.google.com/store/apps/details?id=org.mivvo.parent" },
    ],
  };
}
