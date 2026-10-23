import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import { legalDocs } from "@/lib/legal";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const homeAlternates = { languages: { tr: absoluteUrl("/"), en: absoluteUrl("/en") } };

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1, alternates: homeAlternates },
    { url: absoluteUrl("/en"), lastModified: now, changeFrequency: "weekly", priority: 0.8, alternates: homeAlternates },
    { url: absoluteUrl("/rehber"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...guides.map((g) => ({
      url: absoluteUrl(`/rehber/${g.slug}`),
      lastModified: new Date(g.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: absoluteUrl("/indir"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/iletisim"), changeFrequency: "yearly", priority: 0.3 },
    ...legalDocs.map((d) => ({ url: absoluteUrl(`/${d.slug}`), lastModified: new Date(d.updated), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
