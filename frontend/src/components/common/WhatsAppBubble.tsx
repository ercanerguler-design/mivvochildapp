import type { Locale } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Floating WhatsApp support button; opens a chat with a ready first message. */
export function WhatsAppBubble({ locale = "tr" }: { locale?: Locale }) {
  const label = locale === "en" ? "WhatsApp Support" : "WhatsApp Destek";
  return (
    <a
      href={whatsappUrl(locale)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="group fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-emerald-900/20 transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-6 w-6" />
      {/* Label appears on hover (desktop) so the button stays small. */}
      <span className="pointer-events-none absolute right-14 hidden whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 sm:block">{label}</span>
    </a>
  );
}
