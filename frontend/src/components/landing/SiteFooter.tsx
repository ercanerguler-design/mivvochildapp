import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { MivvoLogo } from "@/components/common/MivvoLogo";
import type { Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { landingContent } from "./content";

export function SiteFooter({ locale }: { locale: Locale }) {
  const c = landingContent[locale];
  const f = c.footer;
  const home = locale === "en" ? "/en" : "/";
  const col = "space-y-2.5 text-sm";
  const link = "text-gray-400 transition-colors hover:text-white";

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <MivvoLogo size={30} textClassName="text-2xl text-white" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{f.tagline}</p>
            <div className="mt-5 space-y-2 text-sm">
              <a href={`mailto:${SITE.email}`} className={`flex items-center gap-2 ${link}`}><Mail className="h-4 w-4" />{SITE.email}</a>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${link}`}><MessageCircle className="h-4 w-4" />WhatsApp</a>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{SITE.address.city}, Türkiye</p>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">{f.product}</p>
            <ul className={col}>
              <li><Link className={link} href={`${home}#ozellikler`}>{c.nav.features}</Link></li>
              <li><Link className={link} href={`${home}#fiyat`}>{c.nav.pricing}</Link></li>
              <li><Link className={link} href="/indir">{f.download}</Link></li>
              <li><Link className={link} href={`${home}#sss`}>{c.nav.faq}</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">{f.resources}</p>
            <ul className={col}>
              <li><Link className={link} href="/rehber">{f.guide}</Link></li>
              <li><Link className={link} href="/kurulum">{f.setup}</Link></li>
              <li><a className={link} href={SITE.parentPlayUrl} target="_blank" rel="noopener noreferrer">Google Play</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">{f.company}</p>
            <ul className={col}>
              <li><Link className={link} href="/iletisim">{f.contact}</Link></li>
              <li><Link className={link} href="/gizlilik">{f.privacy}</Link></li>
              <li><Link className={link} href="/kvkk">{f.kvkk}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Mivvo · {SITE.company}. {f.rights}</p>
          <p className="text-gray-500">{f.help}</p>
        </div>
      </div>
    </footer>
  );
}
